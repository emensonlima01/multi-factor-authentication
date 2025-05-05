using MFAApi.Models;
using MFAApi.Models.DTOs;
using BCrypt.Net;

namespace MFAApi.Services;

public class AuthService
{
    private readonly MongoDBService _dbService;
    private readonly TokenService _tokenService;
    private readonly OTPService _otpService;
    private readonly ILogger<AuthService> _logger;

    private const int MAX_FAILED_ATTEMPTS = 5;
    private readonly TimeSpan LOCKOUT_DURATION = TimeSpan.FromMinutes(15);

    public AuthService(
        MongoDBService dbService,
        TokenService tokenService,
        OTPService otpService,
        ILogger<AuthService> logger)
    {
        _dbService = dbService;
        _tokenService = tokenService;
        _otpService = otpService;
        _logger = logger;
    }

    public async Task<AuthResponse> Login(LoginRequest request)
    {
        // Verificar se o usuário existe
        var user = await _dbService.GetUserByEmail(request.Email);
        if (user == null)
        {
            _logger.LogWarning("Tentativa de login com email não cadastrado: {Email}", request.Email);
            throw new UnauthorizedAccessException("Credenciais inválidas.");
        }

        // Verificar bloqueio de conta
        var failedAttempts = await _dbService.GetFailedAttemptCount(user.Id, LOCKOUT_DURATION);
        if (failedAttempts >= MAX_FAILED_ATTEMPTS)
        {
            _logger.LogWarning("Conta bloqueada após múltiplas tentativas: {Email}", user.Email);
            throw new UnauthorizedAccessException($"Sua conta está temporariamente bloqueada após múltiplas tentativas falhas. Tente novamente após {LOCKOUT_DURATION.TotalMinutes} minutos.");
        }

        // Verificar senha
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            _logger.LogWarning("Senha inválida para usuário: {Email}", user.Email);

            // Registrar tentativa falha
            await _dbService.AddOtpLog(new OtpLog
            {
                UserId = user.Id,
                OtpCode = "failed_password",
                ExpiresAt = DateTime.UtcNow.Add(LOCKOUT_DURATION),
                Validated = false
            });

            throw new UnauthorizedAccessException("Credenciais inválidas.");
        }

        // Se o usuário tem MFA habilitado, retornar uma resposta que requer verificação adicional
        if (user.IsMfaEnabled)
        {
            var token = _tokenService.GenerateJwtToken(user, false);
            return new AuthResponse
            {
                Token = token,
                RequiresMfa = true,
                Message = "Verificação adicional necessária."
            };
        }

        // Se não tem MFA habilitado, retornar uma resposta autenticada
        var fullToken = _tokenService.GenerateJwtToken(user, true);

        // Remover informações sensíveis antes de retornar
        user.PasswordHash = string.Empty;
        user.MfaSecret = null;

        return new AuthResponse
        {
            Token = fullToken,
            User = user,
            RequiresMfa = false,
            Message = "Login bem-sucedido."
        };
    }

    public async Task<AuthResponse> Register(RegisterRequest request)
    {
        // Validar o pedido de registro
        if (request.Password != request.ConfirmPassword)
        {
            throw new ArgumentException("As senhas não coincidem.");
        }

        // Verificar se o usuário já existe
        bool userExists = await _dbService.UserExists(request.Email);
        if (userExists)
        {
            throw new InvalidOperationException("Email já cadastrado no sistema.");
        }

        // Criar um novo usuário
        var newUser = new User
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsMfaEnabled = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Gerar segredo MFA
        string secret = _otpService.GenerateSecret();
        newUser.MfaSecret = secret;

        // Salvar o usuário
        await _dbService.CreateUser(newUser);

        // Gerar URL para o QR Code
        string qrCodeUrl = _otpService.GenerateQrCodeUrl(secret, newUser.Email);

        // Gerar imagem do QR Code em base64
        string qrCodeBase64 = _otpService.GenerateQrCodeBase64(qrCodeUrl);

        // Gerar token
        var token = _tokenService.GenerateJwtToken(newUser, false);

        return new AuthResponse
        {
            Token = token,
            RequiresMfa = true,
            QrCodeUrl = qrCodeBase64,
            Message = "Usuário registrado com sucesso. Configure o MFA para continuar."
        };
    }

    public async Task<AuthResponse> ValidateOtp(OtpVerificationRequest request)
    {
        try
        {
            // Verificar se o token é válido
            string? email = _tokenService.GetEmailFromToken(request.Token);
            if (string.IsNullOrEmpty(email) || email != request.Email)
            {
                throw new UnauthorizedAccessException("Token inválido ou expirado.");
            }

            var user = await _dbService.GetUserByEmail(request.Email);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Usuário não encontrado.");
            }

            if (string.IsNullOrEmpty(user.MfaSecret))
            {
                throw new InvalidOperationException("MFA não configurado para este usuário.");
            }

            _logger.LogInformation("Validando OTP para usuário {Email}", user.Email);

            // Verificar bloqueio de conta
            var failedAttempts = await _dbService.GetFailedAttemptCount(user.Id, LOCKOUT_DURATION);
            if (failedAttempts >= MAX_FAILED_ATTEMPTS)
            {
                _logger.LogWarning("Conta bloqueada após múltiplas tentativas de OTP: {Email}", user.Email);
                throw new UnauthorizedAccessException($"Sua conta está temporariamente bloqueada após múltiplas tentativas falhas. Tente novamente após {LOCKOUT_DURATION.TotalMinutes} minutos.");
            }

            // Validar o código OTP
            bool isOtpValid = _otpService.ValidateOtp(user.MfaSecret, request.OtpCode);
            if (!isOtpValid)
            {
                _logger.LogWarning("Código OTP inválido para usuário: {Email}", user.Email);

                // Registrar tentativa falha
                await _dbService.AddOtpLog(new OtpLog
                {
                    UserId = user.Id,
                    OtpCode = request.OtpCode,
                    ExpiresAt = DateTime.UtcNow.Add(LOCKOUT_DURATION),
                    Validated = false
                });

                throw new UnauthorizedAccessException("Código OTP inválido.");
            }

            // Registrar tentativa bem-sucedida
            var otpLog = new OtpLog
            {
                UserId = user.Id,
                OtpCode = request.OtpCode,
                ExpiresAt = DateTime.UtcNow.AddMinutes(1),
                Validated = true
            };
            await _dbService.AddOtpLog(otpLog);

            // Se o MFA ainda não foi ativado, ativar agora
            if (!user.IsMfaEnabled)
            {
                user.IsMfaEnabled = true;
                await _dbService.UpdateUser(user.Id, user);
            }

            // Gerar token completo
            var fullToken = _tokenService.GenerateJwtToken(user, true);

            // Remover informações sensíveis antes de retornar
            user.PasswordHash = string.Empty;
            user.MfaSecret = null;

            return new AuthResponse
            {
                Token = fullToken,
                User = user,
                RequiresMfa = false,
                Message = "Autenticação bem-sucedida."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao validar OTP para {Email}", request.Email);
            throw;
        }
    }

    public async Task<AuthResponse> SetupMfa(string email)
    {
        // Verificar se o usuário existe
        var user = await _dbService.GetUserByEmail(email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Usuário não encontrado.");
        }

        // Se o usuário não tem um segredo MFA, criar um
        if (string.IsNullOrEmpty(user.MfaSecret))
        {
            string secret = _otpService.GenerateSecret();
            user.MfaSecret = secret;
            await _dbService.UpdateUser(user.Id, user);
        }

        // Gerar URL para o QR Code
        string qrCodeUrl = _otpService.GenerateQrCodeUrl(user.MfaSecret, user.Email);

        // Gerar imagem do QR Code em base64
        string qrCodeBase64 = _otpService.GenerateQrCodeBase64(qrCodeUrl);

        // Gerar token
        var token = _tokenService.GenerateJwtToken(user, false);

        return new AuthResponse
        {
            Token = token,
            RequiresMfa = true,
            QrCodeUrl = qrCodeBase64,
            Message = "Configure o MFA usando o QR Code fornecido."
        };
    }

    public async Task<AuthResponse> RecoverPassword(RecoveryPasswordRequest request)
    {
        // Buscar usuário pelo nome
        var userByName = (await _dbService.GetUserByEmail(request.Name)) ??
                         await _dbService.GetUserByEmail(request.AdditionalInfo);

        if (userByName == null)
        {
            throw new UnauthorizedAccessException("Não foi possível encontrar sua conta com as informações fornecidas.");
        }

        // Gerar novo segredo MFA
        string secret = _otpService.GenerateSecret();
        userByName.MfaSecret = secret;
        await _dbService.UpdateUser(userByName.Id, userByName);

        // Gerar URL para o QR Code
        string qrCodeUrl = _otpService.GenerateQrCodeUrl(secret, userByName.Email);

        // Gerar imagem do QR Code em base64
        string qrCodeBase64 = _otpService.GenerateQrCodeBase64(qrCodeUrl);

        // Gerar token
        var token = _tokenService.GenerateJwtToken(userByName, false);

        return new AuthResponse
        {
            Token = token,
            RequiresMfa = true,
            QrCodeUrl = qrCodeBase64,
            User = new User { Email = userByName.Email }, // Apenas o e-mail para não expor dados sensíveis
            Message = "Configure o novo MFA para redefinir sua senha."
        };
    }

    public async Task<AuthResponse> ResetPassword(ResetPasswordRequest request)
    {
        // Verificar se as senhas coincidem
        if (request.NewPassword != request.ConfirmNewPassword)
        {
            throw new ArgumentException("As senhas não coincidem.");
        }

        // Verificar se o token é válido
        string? email = _tokenService.GetEmailFromToken(request.Token);
        if (string.IsNullOrEmpty(email) || email != request.Email)
        {
            throw new UnauthorizedAccessException("Token inválido ou expirado.");
        }

        // Buscar o usuário
        var user = await _dbService.GetUserByEmail(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Usuário não encontrado.");
        }

        // Verificar o código OTP
        if (string.IsNullOrEmpty(user.MfaSecret))
        {
            throw new InvalidOperationException("MFA não configurado para este usuário.");
        }

        bool isOtpValid = _otpService.ValidateOtp(user.MfaSecret, request.OtpCode);
        if (!isOtpValid)
        {
            throw new UnauthorizedAccessException("Código OTP inválido.");
        }

        // Atualizar a senha
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _dbService.UpdateUser(user.Id, user);

        return new AuthResponse
        {
            Message = "Senha redefinida com sucesso.",
            RequiresMfa = false
        };
    }
}
