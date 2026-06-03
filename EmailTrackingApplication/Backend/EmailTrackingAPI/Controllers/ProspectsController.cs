using Microsoft.AspNetCore.Mvc;
using EmailTrackingAPI.Models;
using EmailTrackingAPI.Services;

namespace EmailTrackingAPI.Controllers
{
    [ApiController]
    [Route("apiEmail/[controller]")]
    public class ProspectsController : ControllerBase
    {
        private readonly IProspectService _prospectService;

        public ProspectsController(IProspectService prospectService)
        {
            _prospectService = prospectService;
        }

        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            return Request.Headers.TryGetValue("userId", out var header) &&
                   int.TryParse(header.FirstOrDefault(), out userId) &&
                   userId != 0;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<Prospect>>>> GetProspects()
        {
            if (!TryGetUserId(out _))
                return Unauthorized(new ApiResponse<List<Prospect>> { Success = false, Message = "User not authenticated" });

            var prospects = await _prospectService.GetProspects();
            return Ok(new ApiResponse<List<Prospect>>
            {
                Success = true,
                Message = "Prospects retrieved successfully",
                Data = prospects
            });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<Prospect>>> AddProspect([FromBody] AddProspectRequest request)
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new ApiResponse<Prospect> { Success = false, Message = "User not authenticated" });

            if (string.IsNullOrWhiteSpace(request.ProspectName))
                return BadRequest(new ApiResponse<Prospect> { Success = false, Message = "Prospect name is required" });

            var prospect = await _prospectService.AddProspect(request, userId);
            if (prospect == null)
                return BadRequest(new ApiResponse<Prospect> { Success = false, Message = "Failed to add prospect" });

            return Ok(new ApiResponse<Prospect>
            {
                Success = true,
                Message = "Prospect added successfully",
                Data = prospect
            });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateProspect(int id, [FromBody] UpdateProspectRequest request)
        {
            if (!TryGetUserId(out _))
                return Unauthorized(new ApiResponse<string> { Success = false, Message = "User not authenticated" });

            var success = await _prospectService.UpdateProspect(id, request);
            if (!success)
                return BadRequest(new ApiResponse<string> { Success = false, Message = "Failed to update prospect" });

            return Ok(new ApiResponse<string> { Success = true, Message = "Prospect updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteProspect(int id)
        {
            if (!TryGetUserId(out _))
                return Unauthorized(new ApiResponse<string> { Success = false, Message = "User not authenticated" });

            bool.TryParse(Request.Headers["isDirector"].FirstOrDefault(), out bool isDirector);
            if (!isDirector)
                return StatusCode(403, new ApiResponse<string> { Success = false, Message = "Only admins can delete prospects" });

            var success = await _prospectService.DeleteProspect(id);
            if (!success)
                return BadRequest(new ApiResponse<string> { Success = false, Message = "Failed to delete prospect" });

            return Ok(new ApiResponse<string> { Success = true, Message = "Prospect deleted successfully" });
        }
    }
}
