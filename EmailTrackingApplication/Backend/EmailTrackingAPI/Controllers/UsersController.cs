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

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetUsers()
        {
            if (!Request.Headers.TryGetValue("userId", out var header) ||
                !int.TryParse(header.FirstOrDefault(), out int userId) || userId == 0)
                return Unauthorized(new ApiResponse<List<UserDto>> { Success = false, Message = "User not authenticated" });

            var users = await _context.Users
                .Where(u => u.IsActive)
                .OrderBy(u => u.Username)
                .Select(u => new UserDto { Id = u.Id, Username = u.Username })
                .ToListAsync();

            return Ok(new ApiResponse<List<UserDto>>
            {
                Success = true,
                Message = "Users retrieved successfully",
                Data = users
            });
        }
    }
}
