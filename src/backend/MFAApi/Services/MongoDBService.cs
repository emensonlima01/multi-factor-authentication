using System.Text;
using MongoDB.Driver;

namespace MFAApi.Services;

public class DatabaseSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
    public string UsersCollectionName { get; set; } = string.Empty;
    public string OtpLogsCollectionName { get; set; } = string.Empty;
}

public class MongoDBService
{
    private readonly IMongoCollection<Models.User> _usersCollection;
    private readonly IMongoCollection<Models.OtpLog> _otpLogsCollection;

    public MongoDBService(IConfiguration configuration)
    {
        var settings = new DatabaseSettings();
        configuration.GetSection("MongoDB").Bind(settings);

        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);

        _usersCollection = database.GetCollection<Models.User>(settings.UsersCollectionName);
        _otpLogsCollection = database.GetCollection<Models.OtpLog>(settings.OtpLogsCollectionName);

        // Garantir que temos índices apropriados para consultas rápidas
        CreateIndexes();
    }

    private void CreateIndexes()
    {
        // Índice único para o email do usuário
        var indexKeyDefinition = Builders<Models.User>.IndexKeys.Ascending(u => u.Email);
        var indexOptions = new CreateIndexOptions { Unique = true };
        _usersCollection.Indexes.CreateOne(new CreateIndexModel<Models.User>(indexKeyDefinition, indexOptions));

        // Índice para logs de OTP por usuário e código
        var otpIndexKeyDefinition = Builders<Models.OtpLog>.IndexKeys
            .Ascending(o => o.UserId)
            .Ascending(o => o.OtpCode);
        _otpLogsCollection.Indexes.CreateOne(new CreateIndexModel<Models.OtpLog>(otpIndexKeyDefinition));
    }

    // Métodos para operações com usuários
    public async Task<Models.User?> GetUserByEmail(string email)
    {
        return await _usersCollection
            .Find(u => u.Email == email)
            .FirstOrDefaultAsync();
    }

    public async Task<Models.User?> GetUserById(string id)
    {
        return await _usersCollection
            .Find(u => u.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<Models.User> CreateUser(Models.User user)
    {
        await _usersCollection.InsertOneAsync(user);
        return user;
    }

    public async Task UpdateUser(string id, Models.User updatedUser)
    {
        updatedUser.UpdatedAt = DateTime.UtcNow;
        await _usersCollection.ReplaceOneAsync(u => u.Id == id, updatedUser);
    }

    public async Task<bool> UserExists(string email)
    {
        var count = await _usersCollection.CountDocumentsAsync(u => u.Email == email);
        return count > 0;
    }

    // Métodos para operações com logs de OTP
    public async Task AddOtpLog(Models.OtpLog otpLog)
    {
        // Garantir que a data de criação esteja definida
        if (otpLog.CreatedAt == DateTime.MinValue)
        {
            otpLog.CreatedAt = DateTime.UtcNow;
        }

        await _otpLogsCollection.InsertOneAsync(otpLog);
    }

    public async Task<Models.OtpLog?> GetLatestValidOtpLog(string userId, string otpCode)
    {
        return await _otpLogsCollection
            .Find(o => o.UserId == userId &&
                      o.OtpCode == otpCode &&
                      o.ExpiresAt > DateTime.UtcNow &&
                      !o.Validated)
            .SortByDescending(o => o.ExpiresAt)
            .FirstOrDefaultAsync();
    }

    public async Task MarkOtpAsValidated(string id)
    {
        var update = Builders<Models.OtpLog>.Update.Set(o => o.Validated, true);
        await _otpLogsCollection.UpdateOneAsync(o => o.Id == id, update);
    }

    public async Task<int> GetFailedAttemptCount(string userId, TimeSpan duration)
    {
        var cutoffTime = DateTime.UtcNow.Subtract(duration);
        return (int)await _otpLogsCollection
            .CountDocumentsAsync(o => o.UserId == userId &&
                               o.CreatedAt >= cutoffTime &&
                              !o.Validated);
    }
}
