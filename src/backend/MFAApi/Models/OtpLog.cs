using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MFAApi.Models;

public class OtpLog
{
    [BsonId] // Indica que esta propriedade é o _id
    [BsonRepresentation(BsonType.ObjectId)] // Define o tipo como ObjectId no MongoDB
    public string? Id { get; set; } // Alterado para string? e removido o valor padrão

    [BsonRepresentation(BsonType.ObjectId)] // Garante que UserId seja armazenado como ObjectId se for o caso
    public string UserId { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool Validated { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
