namespace MFAApi.Models.DTOs;

public class RecoveryPasswordRequest
{
    public string Name { get; set; } = string.Empty;
    public string AdditionalInfo { get; set; } = string.Empty;
}
