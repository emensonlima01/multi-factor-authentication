namespace MFAApi.Models.DTOs;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public User? User { get; set; }
    public bool RequiresMfa { get; set; }
    public string? QrCodeUrl { get; set; }
    public string? Message { get; set; }
}
