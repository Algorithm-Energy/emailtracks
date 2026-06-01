using Microsoft.AspNetCore.Mvc;
using EmailTrackingAPI.Models;
using EmailTrackingAPI.Services;
using System.Threading.Tasks;

namespace EmailTrackingAPI.Controllers
{
    [Route("apiEmail/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthenticationService _authService;

        public AuthController(IAuthenticationService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.UsernameOrEmail) || 
                    string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new ApiResponse<LoginResponse>
                    {
                        Success = false,
                        Message = "Username/Email and password are required."
                    });
                }

                var result = await _authService.Login(request);

                if (result == null)
                {
                    return Unauthorized(new ApiResponse<LoginResponse>
                    {
                        Success = false,
                        Message = "Invalid username/email or password."
                    });
                }

                return Ok(new ApiResponse<LoginResponse>
                {
                    Success = true,
                    Message = "Login successful.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<LoginResponse>
                {
                    Success = false,
                    Message = $"An error occurred during login: {ex.Message}"
                });
            }
        }
    }
}
