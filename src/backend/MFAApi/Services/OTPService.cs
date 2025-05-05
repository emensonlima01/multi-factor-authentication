using OtpNet;
using QRCoder;
using MFAApi.Utils;

namespace MFAApi.Services;

public class OTPService
{
    private const string Issuer = "MFAApi";
    private const int DefaultSecretSize = 20;

    // Gerar uma chave secreta aleatória para o MFA
    public string GenerateSecret(int size = DefaultSecretSize)
    {
        var key = KeyGeneration.GenerateRandomKey(size);
        return Base32Encoding.ToString(key);
    }

    // Gerar o URL para o código QR
    public string GenerateQrCodeUrl(string secret, string email, string issuer = Issuer)
    {
        var provisioningUri = $"otpauth://totp/{Uri.EscapeDataString(issuer)}:{Uri.EscapeDataString(email)}?secret={secret}&issuer={Uri.EscapeDataString(issuer)}";
        return provisioningUri;
    }

    // Validar um código OTP fornecido pelo usuário
    public bool ValidateOtp(string secret, string otpCode)
    {
        try
        {
            var key = Base32Encoding.ToBytes(secret);
            var totp = new Totp(key);

            // Verifica se o código fornecido é válido, com uma janela de tempo de 1 intervalo (30 segundos)
            return totp.VerifyTotp(otpCode, out _, new VerificationWindow(1, 1));
        }
        catch
        {
            // Se houver qualquer erro na validação (formato inválido, etc.), retorna falso
            return false;
        }
    }

    // Gerar uma imagem QR Code a partir de uma URL
    public byte[] GenerateQrCodeImage(string qrCodeUrl)
    {
        var qrGenerator = new QRCodeGenerator();
        var qrCodeData = qrGenerator.CreateQrCode(qrCodeUrl, QRCodeGenerator.ECCLevel.Q);
        var qrCode = new Utils.PngByteQRCode(qrCodeData);
        return qrCode.GetGraphic(20);
    }

    // Gerar uma string base64 de QR Code a partir de uma URL
    public string GenerateQrCodeBase64(string qrCodeUrl)
    {
        var qrGenerator = new QRCodeGenerator();
        var qrCodeData = qrGenerator.CreateQrCode(qrCodeUrl, QRCodeGenerator.ECCLevel.Q);
        var qrCode = new Utils.PngByteQRCode(qrCodeData);
        return $"data:image/svg+xml;base64,{qrCode.GetBase64Image(20)}";
    }
}
