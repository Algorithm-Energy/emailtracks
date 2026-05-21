using Microsoft.AspNetCore.Mvc;
using EmailTrackingAPI.Models;
using EmailTrackingAPI.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace EmailTrackingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompaniesController : ControllerBase
    {
        private readonly ICompanyService _companyService;

        public CompaniesController(ICompanyService companyService)
        {
            _companyService = companyService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<Company>>>> GetCompanies()
        {
             Console.WriteLine(Request.Headers["userId"]);
            if (!Request.Headers.TryGetValue("userId", out var userIdHeader))
            {
                return Unauthorized(new ApiResponse<DuplicateCheckResponse>
                {
                    Success = false,
                    Message = "UserId header missing"
                });
            }
            if (!int.TryParse(userIdHeader.FirstOrDefault(), out int userId))
            {
                return Unauthorized(new ApiResponse<DuplicateCheckResponse>
                {
                    Success = false,
                    Message = "Invalid UserId header"
                });
            }
            //var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
            var isDirector = bool.Parse(User.FindFirst("IsDirector")?.Value ?? "false");

            if (userId == 0)
                return Unauthorized(new ApiResponse<List<Company>> { Success = false, Message = "User not authenticated" });

            var companies = await _companyService.GetCompanies(userId, isDirector);
            return Ok(new ApiResponse<List<Company>>
            {
                Success = true,
                Message = "Companies retrieved successfully",
                Data = companies
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<Company>>> GetCompanyById(int id)
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
            var isDirector = bool.Parse(User.FindFirst("IsDirector")?.Value ?? "false");

            if (userId == 0)
                return Unauthorized(new ApiResponse<Company> { Success = false, Message = "User not authenticated" });

            var company = await _companyService.GetCompanyById(id, userId, isDirector);
            if (company == null)
                return NotFound(new ApiResponse<Company> { Success = false, Message = "Company not found" });

            return Ok(new ApiResponse<Company>
            {
                Success = true,
                Message = "Company retrieved successfully",
                Data = company
            });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<Company>>> AddCompany([FromBody] AddCompanyRequest request)
        {
            Console.WriteLine(Request.Headers["userId"]);
            if (!Request.Headers.TryGetValue("userId", out var userIdHeader))
            {
                return Unauthorized(new ApiResponse<DuplicateCheckResponse>
                {
                    Success = false,
                    Message = "UserId header missing"
                });
            }
            if (!int.TryParse(userIdHeader.FirstOrDefault(), out int userId))
            {
                return Unauthorized(new ApiResponse<DuplicateCheckResponse>
                {
                    Success = false,
                    Message = "Invalid UserId header"
                });
            }
            //var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");

            if (userId == 0)
                return Unauthorized(new ApiResponse<Company> { Success = false, Message = "User not authenticated" });

            if (string.IsNullOrWhiteSpace(request.CompanyName) || 
                string.IsNullOrWhiteSpace(request.Region) ||
                string.IsNullOrWhiteSpace(request.Emails))
                return BadRequest(new ApiResponse<Company> { Success = false, Message = "Invalid input data" });

            var company = await _companyService.AddCompany(request, userId);
            if (company == null)
                return BadRequest(new ApiResponse<Company> { Success = false, Message = "Failed to add company" });

            return Ok(new ApiResponse<Company>
            {
                Success = true,
                Message = "Company added successfully",
                Data = company
            });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateCompany(int id, [FromBody] UpdateCompanyRequest request)
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
            var isDirector = bool.Parse(User.FindFirst("IsDirector")?.Value ?? "false");

            if (userId == 0)
                return Unauthorized(new ApiResponse<string> { Success = false, Message = "User not authenticated - Failed to update company" });

            var success = await _companyService.UpdateCompany(id, request, userId, isDirector);
            if (!success)
                return BadRequest(new ApiResponse<string> { Success = false, Message = "Failed to update company" });

            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = "Company updated successfully"
            });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteCompany(int id)
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
            var isDirector = bool.Parse(User.FindFirst("IsDirector")?.Value ?? "false");

            if (userId == 0)
                return Unauthorized(new ApiResponse<string> { Success = false, Message = "User not authenticated" });

            var success = await _companyService.DeleteCompany(id, userId, isDirector);
            if (!success)
                return BadRequest(new ApiResponse<string> { Success = false, Message = "Failed to delete company" });

            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = "Company deleted successfully"
            });
        }

        [HttpPost("check-duplicate")]
        public async Task<ActionResult<ApiResponse<DuplicateCheckResponse>>> CheckDuplicate([FromBody] DuplicateCheckRequest request)
        
        
        {
            Console.WriteLine(Request.Headers["userId"]);
              if (!Request.Headers.TryGetValue("userId", out var userIdHeader))
    {
        return Unauthorized(new ApiResponse<DuplicateCheckResponse>
        {
            Success = false,
            Message = "UserId header missing"
        });
    }
    if (!int.TryParse(userIdHeader.FirstOrDefault(), out int userId))
    {
        return Unauthorized(new ApiResponse<DuplicateCheckResponse>
        {
            Success = false,
            Message = "Invalid UserId header"
        });
    }
     Console.WriteLine(userId);
            // var userId = int.Parse(User.FindFirst("Userid")?.Value ?? "0");

            if (userId == 0)
                return Unauthorized(new ApiResponse<DuplicateCheckResponse> { Success = false, Message = "User not authenticated" });

            if (string.IsNullOrWhiteSpace(request.CompanyName))
                return BadRequest(new ApiResponse<DuplicateCheckResponse> { Success = false, Message = "Company name is required" });

            var result = await _companyService.CheckDuplicateCompany(request.CompanyName, userId);
            return Ok(new ApiResponse<DuplicateCheckResponse>
            {
                Success = true,
                Message = "Duplicate check completed",
                Data = result
            });
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
            var isDirector = bool.Parse(User.FindFirst("IsDirector")?.Value ?? "false");

            if (userId == 0)
                return Unauthorized(new ApiResponse<string> { Success = false, Message = "User not authenticated" });

            var success = await _companyService.UpdateStatus(id, request, userId, isDirector);
            if (!success)
                return BadRequest(new ApiResponse<string> { Success = false, Message = "Failed to update status" });

            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = "Status updated successfully"
            });
        }

        [HttpPut("{id}/mark-as-pending")]
        public async Task<ActionResult<ApiResponse<string>>> MarkAsPending(int id)
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
            var isDirector = bool.Parse(User.FindFirst("IsDirector")?.Value ?? "false");

            if (userId == 0)
                return Unauthorized(new ApiResponse<string> { Success = false, Message = "User not authenticated" });

            var success = await _companyService.MarkAsPending(id, userId, isDirector);
            if (!success)
                return BadRequest(new ApiResponse<string> { Success = false, Message = "Failed to mark as pending" });

            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = "Company marked as pending successfully"
            });
        }
    }
}
