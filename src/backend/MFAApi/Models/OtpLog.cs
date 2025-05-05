namespace MFAApi.Models;

public class OtpLog
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool Validated { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
