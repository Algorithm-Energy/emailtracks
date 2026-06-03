using EmailTrackingAPI.Models;
using EmailTrackingAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace EmailTrackingAPI.Services
{
    public interface IActivityLogService
    {
        Task LogAsync(string entityType, int entityId, int userId, string action);
        Task<List<ActivityLogEntry>> GetLogAsync(string entityType, int entityId);
    }

    public class ActivityLogService : IActivityLogService
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(string entityType, int entityId, int userId, string action)
        {
            _context.ActivityLogs.Add(new ActivityLog
            {
                EntityType = entityType,
                EntityId   = entityId,
                UserId     = userId,
                Action     = action,
                CreatedAt  = DateTime.UtcNow,
            });
            await _context.SaveChangesAsync();
        }

        public async Task<List<ActivityLogEntry>> GetLogAsync(string entityType, int entityId)
        {
            return await _context.ActivityLogs
                .Where(a => a.EntityType == entityType && a.EntityId == entityId)
                .OrderByDescending(a => a.CreatedAt)
                .Join(
                    _context.Users,
                    a => a.UserId,
                    u => u.Id,
                    (a, u) => new ActivityLogEntry
                    {
                        Id        = a.Id,
                        Username  = u.Username,
                        Action    = a.Action,
                        CreatedAt = a.CreatedAt,
                    })
                .ToListAsync();
        }
    }
}
