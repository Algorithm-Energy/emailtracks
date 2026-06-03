using Microsoft.AspNetCore.Mvc;
using EmailTrackingAPI.Models;
using EmailTrackingAPI.Services;

namespace EmailTrackingAPI.Controllers
{
    [ApiController]
    [Route("apiEmail/[controller]")]
    public class ActivityLogController : ControllerBase
    {
        private readonly IActivityLogService _logService;

        public ActivityLogController(IActivityLogService logService)
        {
            _logService = logService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<ActivityLogEntry>>>> GetLog(
            [FromQuery] string entityType,
            [FromQuery] int entityId)
        {
            if (!Request.Headers.TryGetValue("userId", out var header) ||
                !int.TryParse(header.FirstOrDefault(), out int userId) || userId == 0)
                return Unauthorized(new ApiResponse<List<ActivityLogEntry>> { Success = false, Message = "User not authenticated" });

            var entries = await _logService.GetLogAsync(entityType, entityId);
            return Ok(new ApiResponse<List<ActivityLogEntry>> { Success = true, Data = entries });
        }
    }
}
