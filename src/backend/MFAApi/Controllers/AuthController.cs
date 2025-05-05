using Microsoft.AspNetCore.Mvc;
using MFAApi.Models.DTOs;
using MFAApi.Services;

namespace MFAApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.Login(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Falha de login: {Message}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro durante o login");
            return StatusCode(500, new { message = "Ocorreu um erro ao processar a solicitação." });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var response = await _authService.Register(request);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Dados de registro inválidos: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Operação inválida durante o registro: {Message}", ex.Message);
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro durante o registro");
            return StatusCode(500, new { message = "Ocorreu um erro ao processar a solicitação." });
        }
    }

    [HttpPost("verify-otp")]
    public async Task<ActionResult<AuthResponse>> VerifyOtp([FromBody] OtpVerificationRequest request)
    {
        try
        {
            var response = await _authService.ValidateOtp(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Falha na verificação de OTP: {Message}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Operação inválida durante a verificação de OTP: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro durante a verificação de OTP");
            return StatusCode(500, new { message = "Ocorreu um erro ao processar a solicitação." });
        }
    }

    [HttpGet("mfa-setup")]
    public async Task<ActionResult<AuthResponse>> GetMfaSetup([FromQuery] string email)
    {
        try
        {
            var response = await _authService.SetupMfa(email);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Acesso não autorizado ao configurar MFA: {Message}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro durante a configuração do MFA");
            return StatusCode(500, new { message = "Ocorreu um erro ao processar a solicitação." });
        }
    }

    [HttpPost("mfa-validate")]
    public async Task<ActionResult<AuthResponse>> ValidateMfa([FromBody] OtpVerificationRequest request)
    {
        try
        {
            var response = await _authService.ValidateOtp(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Falha na validação de MFA: {Message}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Operação inválida durante a validação de MFA: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro durante a validação do MFA");
            return StatusCode(500, new { message = "Ocorreu um erro ao processar a solicitação." });
        }
    }

    [HttpPost("recover-password")]
    public async Task<ActionResult<AuthResponse>> RecoverPassword([FromBody] RecoveryPasswordRequest request)
    {
        try
        {
            var response = await _authService.RecoverPassword(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Falha na recuperação de senha: {Message}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro durante a recuperação de senha");
            return StatusCode(500, new { message = "Ocorreu um erro ao processar a solicitação." });
        }
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<AuthResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            var response = await _authService.ResetPassword(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Falha na redefinição de senha: {Message}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Dados de redefinição de senha inválidos: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro durante a redefinição de senha");
            return StatusCode(500, new { message = "Ocorreu um erro ao processar a solicitação." });
        }
    }
}
