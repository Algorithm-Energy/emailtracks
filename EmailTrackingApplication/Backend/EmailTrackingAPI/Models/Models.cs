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
    }   

    public class AddCompanyRequest
    {
        public string? CompanyName { get; set; }
        public string? Region { get; set; }
        public string? Link { get; set; }
        public string? Emails { get; set; }
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
    }

    public class DuplicateCheckResponse
    {
        public bool Exists { get; set; }
        public string? Message { get; set; }
    }
}