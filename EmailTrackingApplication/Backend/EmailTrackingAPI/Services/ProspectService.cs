using EmailTrackingAPI.Models;
using EmailTrackingAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace EmailTrackingAPI.Services
{
    public interface IProspectService
    {
        Task<List<Prospect>> GetProspects();
        Task<Prospect?> AddProspect(AddProspectRequest request, int createdByUserId);
        Task<bool> UpdateProspect(int id, UpdateProspectRequest request, int userId);
        Task<bool> DeleteProspect(int id);
    }

    public class ProspectService : IProspectService
    {
        private readonly ApplicationDbContext _context;
        private readonly IActivityLogService _log;

        public ProspectService(ApplicationDbContext context, IActivityLogService log)
        {
            _context = context;
            _log = log;
        }

        public async Task<List<Prospect>> GetProspects()
        {
            var prospects = await _context.Prospects
                .OrderByDescending(p => p.UpdatedAt)
                .ToListAsync();

            // Resolve usernames in one query rather than N+1
            var userIds = prospects
                .SelectMany(p => new[] { (int?)p.CreatedByUserId, p.AssignedToUserId })
                .Where(id => id.HasValue)
                .Select(id => id!.Value)
                .Distinct()
                .ToList();

            var userMap = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Username);

            foreach (var p in prospects)
            {
                p.CreatedByUsername = userMap.GetValueOrDefault(p.CreatedByUserId);
                if (p.AssignedToUserId.HasValue)
                    p.AssignedToUsername = userMap.GetValueOrDefault(p.AssignedToUserId.Value);
            }

            return prospects;
        }

        public async Task<Prospect?> AddProspect(AddProspectRequest request, int createdByUserId)
        {
            if (string.IsNullOrWhiteSpace(request.ProspectName))
                return null;

            var prospect = new Prospect
            {
                ProspectName     = request.ProspectName,
                ContactPerson    = request.ContactPerson,
                ContactEmail     = request.ContactEmail,
                ContactPhone     = request.ContactPhone,
                ProspectType     = request.ProspectType ?? "Direct Client",
                ReferredBy       = request.ReferredBy,
                Source           = request.Source,
                Status           = "First Meeting",
                AssignedToUserId = request.AssignedToUserId,
                CreatedByUserId  = createdByUserId,
                CreatedAt        = DateTime.UtcNow,
                UpdatedAt        = DateTime.UtcNow,
            };

            _context.Prospects.Add(prospect);
            await _context.SaveChangesAsync();
            await _log.LogAsync("Prospect", prospect.Id, createdByUserId, "Prospect created");

            return prospect;
        }

        public async Task<bool> UpdateProspect(int id, UpdateProspectRequest request, int userId)
        {
            var prospect = await _context.Prospects.FindAsync(id);
            if (prospect == null) return false;

            var oldStatus = prospect.Status;

            // Required fields use ?? to protect against accidental null
            prospect.ProspectName  = request.ProspectName  ?? prospect.ProspectName;
            prospect.Status        = request.Status        ?? prospect.Status;

            // Optional fields set directly (null = clear the value)
            prospect.ContactPerson  = request.ContactPerson;
            prospect.ContactEmail   = request.ContactEmail;
            prospect.ContactPhone   = request.ContactPhone;
            prospect.ProspectType   = request.ProspectType ?? prospect.ProspectType;
            prospect.ReferredBy     = request.ReferredBy;
            prospect.Source         = request.Source;
            prospect.Notes          = request.Notes;
            prospect.NextAction     = request.NextAction;
            prospect.NextActionDate = request.ClearNextActionDate ? null : request.NextActionDate;
            prospect.AssignedToUserId = request.ClearAssignedTo ? null : request.AssignedToUserId;
            prospect.UpdatedAt      = DateTime.UtcNow;

            _context.Prospects.Update(prospect);
            await _context.SaveChangesAsync();

            var action = oldStatus != prospect.Status
                ? $"Status changed from '{oldStatus}' to '{prospect.Status}'"
                : "Record updated";
            await _log.LogAsync("Prospect", id, userId, action);

            return true;
        }

        public async Task<bool> DeleteProspect(int id)
        {
            var prospect = await _context.Prospects.FindAsync(id);
            if (prospect == null) return false;

            _context.Prospects.Remove(prospect);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
