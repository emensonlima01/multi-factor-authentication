namespace MFAApi.Models.DTOs;

public class OtpVerificationRequest
{
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}
