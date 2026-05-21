using EmailTrackingAPI.Models;
using EmailTrackingAPI.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EmailTrackingAPI.Services
{
    public interface ICompanyService
    {
        Task<List<Company>> GetCompanies(int userId, bool isDirector);
        Task<Company?> GetCompanyById(int companyId, int userId, bool isDirector);
        Task<Company?> AddCompany(AddCompanyRequest request, int userId);
        Task<bool> UpdateCompany(int companyId, UpdateCompanyRequest request, int userId, bool isDirector);
        Task<bool> DeleteCompany(int companyId, int userId, bool isDirector);
        Task<DuplicateCheckResponse> CheckDuplicateCompany(string companyName, int userId);
        Task<bool> UpdateStatus(int companyId, UpdateStatusRequest request, int userId, bool isDirector);
        Task<bool> MarkAsPending(int companyId, int userId, bool isDirector);
    }

    public class CompanyService : ICompanyService
    {
        private readonly ApplicationDbContext _context;

        public CompanyService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ── GetCompanies: join Users to populate Username ──────────────────────
        public async Task<List<Company>> GetCompanies(int userId, bool isDirector)
        {
            var query = isDirector
                ? _context.Companies.AsQueryable()
                : _context.Companies.Where(c => c.UserId == userId);

            var companies = await query
                .OrderByDescending(c => c.CreatedAt)
                .Join(
                    _context.Users,
                    c => c.UserId,
                    u => u.Id,
                    (c, u) => new Company
                    {
                        Id             = c.Id,
                        CompanyName    = c.CompanyName,
                        Region         = c.Region,
                        Link           = c.Link,
                        Emails         = c.Emails,
                        PainPoints     = c.PainPoints,
                        ExactNeeds     = c.ExactNeeds,
                        BuyingTrigger  = c.BuyingTrigger,
                        BestPitchAngle = c.BestPitchAngle,
                        WhyStrongFit   = c.WhyStrongFit,
                        Status         = c.Status,
                        EmailSub       = c.EmailSub,
                        EmailBody      = c.EmailBody,
                        UserId         = c.UserId,
                        Username       = u.Username,
                        CreatedAt      = c.CreatedAt,
                        UpdatedAt      = c.UpdatedAt,
                        LastEmailSentAt = c.LastEmailSentAt
                    })
                .ToListAsync();

            return companies;
        }

        public async Task<Company?> GetCompanyById(int companyId, int userId, bool isDirector)
        {
            var company = await _context.Companies.FindAsync(companyId);

            if (company == null)
                return null;

            if (!isDirector && company.UserId != userId)
                return null;

            var user = await _context.Users.FindAsync(company.UserId);
            company.Username = user?.Username;

            return company;
        }

        public async Task<Company?> AddCompany(AddCompanyRequest request, int userId)
        {
            if (!ValidateEmails(request.Emails ?? string.Empty))
                return null;

            var company = new Company
            {
                CompanyName = request.CompanyName,
                Region      = request.Region,
                Link        = request.Link,
                Emails      = request.Emails,
                Status      = "Pending",          // ← default Pending
                UserId      = userId,
                CreatedAt   = DateTime.UtcNow,
                UpdatedAt   = DateTime.UtcNow
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return company;
        }

        public async Task<bool> UpdateCompany(int companyId, UpdateCompanyRequest request, int userId, bool isDirector)
        {
            var company = await _context.Companies.FindAsync(companyId);

            if (company == null)
                return false;

            if (!isDirector && company.UserId != userId)
                return false;

            if (!string.IsNullOrWhiteSpace(request.Emails) && !ValidateEmails(request.Emails))
                return false;

            company.CompanyName    = request.CompanyName    ?? company.CompanyName;
            company.Region         = request.Region         ?? company.Region;
            company.Link           = request.Link           ?? company.Link;
            company.Emails         = request.Emails         ?? company.Emails;
            company.PainPoints     = request.PainPoints     ?? company.PainPoints;
            company.ExactNeeds     = request.ExactNeeds     ?? company.ExactNeeds;
            company.BuyingTrigger  = request.BuyingTrigger  ?? company.BuyingTrigger;
            company.BestPitchAngle = request.BestPitchAngle ?? company.BestPitchAngle;
            company.WhyStrongFit   = request.WhyStrongFit   ?? company.WhyStrongFit;
            company.Status         = request.Status         ?? company.Status;   // ← now saved
            company.EmailSub       = request.EmailSub       ?? company.EmailSub;
            company.EmailBody      = request.EmailBody      ?? company.EmailBody;
            company.UpdatedAt      = DateTime.UtcNow;

            _context.Companies.Update(company);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteCompany(int companyId, int userId, bool isDirector)
        {
            var company = await _context.Companies.FindAsync(companyId);

            if (company == null)
                return false;

            if (!isDirector && company.UserId != userId)
                return false;

            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<DuplicateCheckResponse> CheckDuplicateCompany(string companyName, int userId)
        {
            var exists = await _context.Companies
                .AnyAsync(c => c.CompanyName!.ToLower() == (companyName ?? string.Empty).ToLower() && c.UserId == userId);

            return new DuplicateCheckResponse
            {
                Exists  = exists,
                Message = exists ? "Company already exists for this user" : "Company name is available"
            };
        }

        public async Task<bool> UpdateStatus(int companyId, UpdateStatusRequest request, int userId, bool isDirector)
        {
            var company = await _context.Companies.FindAsync(companyId);

            if (company == null)
                return false;

            if (!isDirector && company.UserId != userId)
                return false;

            company.Status    = request.Status;
            company.UpdatedAt = DateTime.UtcNow;

            _context.Companies.Update(company);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> MarkAsPending(int companyId, int userId, bool isDirector)
        {
            var company = await _context.Companies.FindAsync(companyId);

            if (company == null)
                return false;

            if (!isDirector && company.UserId != userId)
                return false;

            company.Status          = "Pending";
            company.LastEmailSentAt = DateTime.UtcNow;
            company.UpdatedAt       = DateTime.UtcNow;

            _context.Companies.Update(company);
            await _context.SaveChangesAsync();

            return true;
        }

        private bool ValidateEmails(string emails)
        {
            if (string.IsNullOrWhiteSpace(emails))
                return false;

            var emailList = emails.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);
            foreach (var email in emailList)
            {
                if (!email.Trim().Contains("@") || !email.Trim().Contains("."))
                    return false;
            }

            return emailList.Length > 0;
        }
    }
}