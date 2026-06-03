namespace EmailTrackingAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public bool IsDirector { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class LoginRequest
    {
        public string? UsernameOrEmail { get; set; }
        public string? Password { get; set; }
    }

    public class LoginResponse
    {
        public int UserId { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public bool IsDirector { get; set; }
    }

    public class Company
    {
        public int Id { get; set; }
        public string? CompanyName { get; set; }
        public string? Region { get; set; }
        public string? Link { get; set; }
        public string? Emails { get; set; }
        public string? PainPoints { get; set; }
        public string? ExactNeeds { get; set; }
        public string? BuyingTrigger { get; set; }
        public string? BestPitchAngle { get; set; }
        public string? WhyStrongFit { get; set; }
        public string? Status { get; set; }
        public string? EmailSub { get; set; }
        public string? EmailBody { get; set; }
        public int UserId { get; set; }
        public string? Username { get; set; }  // not mapped, populated via join
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? LastEmailSentAt { get; set; }
        public int isApproved   { get; set; } //
        public bool IsReadyForReview { get; set; } // set by employee when ready for director review
        public string RecordType   { get; set; } //
    }   

    public class AddCompanyRequest
    {
        public string? CompanyName { get; set; }
        public string? Region { get; set; }
        public string? Link { get; set; }
        public string? Emails { get; set; }
        public string? RecordType { get; set; }
    }

    public class UpdateCompanyRequest
    {
        public string? CompanyName { get; set; }
        public string? Region { get; set; }
        public string? Link { get; set; }
        public string? Emails { get; set; }
        public string? PainPoints { get; set; }
        public string? ExactNeeds { get; set; }
        public string? BuyingTrigger { get; set; }
        public string? BestPitchAngle { get; set; }
        public string? WhyStrongFit { get; set; }
        public string? Status { get; set; }
        public string? EmailSub { get; set; }
        public string? EmailBody { get; set; }
    }

    public class UpdateStatusRequest
    {
        public int Status { get; set; }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
    }

    public class DuplicateCheckRequest
    {
        public string? CompanyName { get; set; }
        public string? RecordType { get; set; }
    }

    public class DuplicateCheckResponse
    {
        public bool Exists { get; set; }
        public string? Message { get; set; }
    }

    // ── Activity Log ───────────────────────────────────────────────────────────

    public class ActivityLog
    {
        public int Id { get; set; }
        public string? EntityType { get; set; }   // "Company" | "Prospect"
        public int EntityId { get; set; }
        public int UserId { get; set; }
        public string? Username { get; set; }     // not mapped, populated in service
        public string? Action { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ActivityLogEntry
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string? Action { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ── Prospects ──────────────────────────────────────────────────────────────

    public class Prospect
    {
        public int Id { get; set; }
        public string? ProspectName { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string? Source { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
        public string? NextAction { get; set; }
        public DateTime? NextActionDate { get; set; }
        public string? ProspectType { get; set; }  // "Agent" | "Direct Client"
        public string? ReferredBy { get; set; }
        public int? AssignedToUserId { get; set; }
        public string? AssignedToUsername { get; set; }  // not mapped, populated in service
        public int CreatedByUserId { get; set; }
        public string? CreatedByUsername { get; set; }   // not mapped, populated in service
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class AddProspectRequest
    {
        public string? ProspectName { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string? ProspectType { get; set; }
        public string? ReferredBy { get; set; }
        public string? Source { get; set; }
        public int? AssignedToUserId { get; set; }
    }

    public class UpdateProspectRequest
    {
        public string? ProspectName { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string? ProspectType { get; set; }
        public string? ReferredBy { get; set; }
        public string? Source { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
        public string? NextAction { get; set; }
        public DateTime? NextActionDate { get; set; }
        public int? AssignedToUserId { get; set; }
        public bool ClearAssignedTo { get; set; }
        public bool ClearNextActionDate { get; set; }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string? Username { get; set; }
    }

    public class UserManagementDto
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public bool IsDirector { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateUserRequest
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public bool IsDirector { get; set; }
    }

    public class UpdateUserRequest
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public bool IsDirector { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string? NewPassword { get; set; }
    }
}