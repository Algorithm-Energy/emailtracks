using Microsoft.AspNetCore.Mvc;
using EmailTrackingAPI.Models;
using EmailTrackingAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace EmailTrackingAPI.Controllers
{
    [ApiController]
    [Route("apiEmail/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        private bool TryGetAdmin(out int userId)
        {
            userId = 0;
            if (!Request.Headers.TryGetValue("userId", out var header) ||
                !int.TryParse(header.FirstOrDefault(), out userId) || userId == 0)
                return false;
            return true;
        }

        private bool IsAdmin() =>
            bool.TryParse(Request.Headers["isDirector"].FirstOrDefault(), out var v) && v;

        // ── Existing: dropdown list for Assigned To ──────────────────────────
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetUsers()
        {
            if (!TryGetAdmin(out _))
                return Unauthorized(new ApiResponse<List<UserDto>> { Success = false, Message = "User not authenticated" });

            var users = await _context.Users
                .Where(u => u.IsActive)
                .OrderBy(u => u.Username)
                .Select(u => new UserDto { Id = u.Id, Username = u.Username })
                .ToListAsync();

            return Ok(new ApiResponse<List<UserDto>> { Success = true, Data = users });
        }

        // ── Admin: full user list ─────────────────────────────────────────────
        [HttpGet("all")]
        public async Task<ActionResult<ApiResponse<List<UserManagementDto>>>> GetAllUsers()
        {
            if (!TryGetAdmin(out _) || !IsAdmin())
                return StatusCode(403, new ApiResponse<List<UserManagementDto>> { Success = false, Message = "Admin only" });

            var users = await _context.Users
                .OrderBy(u => u.Username)
                .Select(u => new UserManagementDto
                {
                    Id = u.Id, Username = u.Username, Email = u.Email,
                    IsDirector = u.IsDirector, IsActive = u.IsActive, CreatedAt = u.CreatedAt,
                })
                .ToListAsync();

            return Ok(new ApiResponse<List<UserManagementDto>> { Success = true, Data = users });
        }

        // ── Admin: create user ────────────────────────────────────────────────
        [HttpPost]
        public async Task<ActionResult<ApiResponse<UserManagementDto>>> CreateUser([FromBody] CreateUserRequest request)
        {
            if (!TryGetAdmin(out _) || !IsAdmin())
                return StatusCode(403, new ApiResponse<UserManagementDto> { Success = false, Message = "Admin only" });

            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new ApiResponse<UserManagementDto> { Success = false, Message = "Username and password are required" });

            var exists = await _context.Users.AnyAsync(u => u.Username == request.Username || u.Email == request.Email);
            if (exists)
                return BadRequest(new ApiResponse<UserManagementDto> { Success = false, Message = "Username or email already exists" });

            var user = new User
            {
                Username   = request.Username,
                Email      = request.Email,
                Password   = request.Password,
                IsDirector = request.IsDirector,
                IsActive   = true,
                CreatedAt  = DateTime.UtcNow,
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<UserManagementDto>
            {
                Success = true,
                Message = "User created successfully",
                Data = new UserManagementDto { Id = user.Id, Username = user.Username, Email = user.Email, IsDirector = user.IsDirector, IsActive = user.IsActive, CreatedAt = user.CreatedAt }
            });
        }

        // ── Admin: update user ────────────────────────────────────────────────
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            if (!TryGetAdmin(out _) || !IsAdmin())
                return StatusCode(403, new ApiResponse<string> { Success = false, Message = "Admin only" });

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new ApiResponse<string> { Success = false, Message = "User not found" });

            user.Username   = request.Username   ?? user.Username;
            user.Email      = request.Email      ?? user.Email;
            user.IsDirector = request.IsDirector;
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<string> { Success = true, Message = "User updated successfully" });
        }

        // ── Admin: toggle active ──────────────────────────────────────────────
        [HttpPut("{id}/toggle-active")]
        public async Task<ActionResult<ApiResponse<string>>> ToggleActive(int id)
        {
            if (!TryGetAdmin(out _) || !IsAdmin())
                return StatusCode(403, new ApiResponse<string> { Success = false, Message = "Admin only" });

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new ApiResponse<string> { Success = false, Message = "User not found" });

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<string> { Success = true, Message = $"User {(user.IsActive ? "activated" : "deactivated")}" });
        }

        // ── Admin: reset password ─────────────────────────────────────────────
        [HttpPut("{id}/reset-password")]
        public async Task<ActionResult<ApiResponse<string>>> ResetPassword(int id, [FromBody] ResetPasswordRequest request)
        {
            if (!TryGetAdmin(out _) || !IsAdmin())
                return StatusCode(403, new ApiResponse<string> { Success = false, Message = "Admin only" });

            if (string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest(new ApiResponse<string> { Success = false, Message = "New password is required" });

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new ApiResponse<string> { Success = false, Message = "User not found" });

            user.Password = request.NewPassword;
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<string> { Success = true, Message = "Password reset successfully" });
        }
    }
}
