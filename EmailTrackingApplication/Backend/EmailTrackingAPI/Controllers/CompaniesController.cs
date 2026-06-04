using Microsoft.AspNetCore.Mvc;
using EmailTrackingAPI.Models;
using EmailTrackingAPI.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace EmailTrackingAPI.Controllers
{
    [ApiController]
    [Route("apiEmail/[controller]")]
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
                var isDirectorHeader = Request.Headers["IsDirector"].FirstOrDefault();

                bool isDirector = bool.TryParse(isDirectorHeader, out var result) && result;

            if (userId == 0)
                return Unauthorized(new ApiResponse<List<Company>> { Success = false, Message = "User not authenticated" });
            string recordType = Request.Headers["RecordType"].FirstOrDefault();
            var companies = await _companyService.GetCompanies(userId, isDirector, recordType);
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
            if (!Request.Headers.TryGetValue("userId", out var userIdHeader) ||
                !int.TryParse(userIdHeader.FirstOrDefault(), out int userId) || userId == 0)
                return Unauthorized(new ApiResponse<string> { Success = false, Message = "User not authenticated - Failed to update company" });

            bool.TryParse(Request.Headers["isDirector"].FirstOrDefault(), out bool isDirector);

            var success = await _companyService.UpdateCompany(id, request, userId, isDirector);
            if (!success)
                return BadRequest(new ApiResponse<string> { Success = false, Message = "Failed to update company" });

            return Ok(new ApiResponse<string> { Success = true, Message = "Company updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteCompany(int id)
        {
            if (!Request.Headers.TryGetValue("userId", out var userIdHeader) ||
                !int.TryParse(userIdHeader.FirstOrDefault(), out int userId) || userId == 0)
                return Unauthorized(new ApiResponse<string> { Success = false, Message = "User not authenticated" });

            bool.TryParse(Request.Headers["isDirector"].FirstOrDefault(), out bool isDirector);

            var success = await _companyService.DeleteCompany(id, userId, isDirector);
            if (!success)
                return BadRequest(new ApiResponse<string> { Success = false, Message = "Failed to delete company" });

            return Ok(new ApiResponse<string> { Success = true, Message = "Company deleted successfully" });
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

            var result = await _companyService.CheckDuplicateCompany(request.CompanyName, userId, request.RecordType);
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
            if (!Request.Headers.TryGetValue("userId", out var userIdHeader) ||
                !int.TryParse(userIdHeader.FirstOrDefault(), out int userId) || userId == 0)
                return Unauthorized(new ApiResponse<string> { Success = false, Message = "User not authenticated" });

            bool.TryParse(Request.Headers["isDirector"].FirstOrDefault(), out bool isDirector);

            var success = await _companyService.UpdateStatus(id, request, userId, isDirector);
            if (!success)
                return BadRequest(new ApiResponse<string> { Success = false, Message = "Failed to update status" });

            return Ok(new ApiResponse<string> { Success = true, Message = "Status updated successfully" });
        }

        [HttpGet("review-counts")]
        public async Task<ActionResult<ApiResponse<Dictionary<string, int>>>> GetReviewCounts()
        {
            if (!Request.Headers.TryGetValue("userId", out var userIdHeader) ||
                !int.TryParse(userIdHeader.FirstOrDefault(), out int userId) || userId == 0)
                return Unauthorized(new ApiResponse<Dictionary<string, int>> { Success = false, Message = "User not authenticated" });

            try
            {
                var counts = await _companyService.GetReviewCounts();
                return Ok(new ApiResponse<Dictionary<string, int>> { Success = true, Data = counts });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<Dictionary<string, int>> { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("pending-review")]
        public async Task<ActionResult<ApiResponse<List<Company>>>> GetPendingReview()
        {
            if (!Request.Headers.TryGetValue("userId", out var userIdHeader) ||
                !int.TryParse(userIdHeader.FirstOrDefault(), out int userId) || userId == 0)
                return Unauthorized(new ApiResponse<List<Company>> { Success = false, Message = "User not authenticated" });

            bool.TryParse(Request.Headers["isDirector"].FirstOrDefault(), out bool isDirector);
            if (!isDirector)
                return StatusCode(403, new ApiResponse<List<Company>> { Success = false, Message = "Admin only" });

            try
            {
                var records = await _companyService.GetPendingReview();
                return Ok(new ApiResponse<List<Company>> { Success = true, Data = records });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<Company>> { Success = false, Message = ex.Message });
            }
        }

        [HttpPut("{id}/flag-for-review")]
        public async Task<ActionResult<ApiResponse<string>>> FlagForReview(int id)
        {
            if (!Request.Headers.TryGetValue("userId", out var userIdHeader) ||
                !int.TryParse(userIdHeader.FirstOrDefault(), out int userId) || userId == 0)
                return Unauthorized(new ApiResponse<string> { Success = false, Message = "User not authenticated" });

            bool.TryParse(Request.Headers["isDirector"].FirstOrDefault(), out bool isDirector);

            try
            {
                var success = await _companyService.FlagForReview(id, userId, isDirector);
                if (!success)
                    return BadRequest(new ApiResponse<string> { Success = false, Message = "Failed to flag for review" });

                return Ok(new ApiResponse<string> { Success = true, Message = "Flagged for director review successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string> { Success = false, Message = ex.Message });
            }
        }


        [HttpPut("{id}/flag-for-review-reverted")]
        public async Task<ActionResult<ApiResponse<string>>> RevertFlagForReview(int id)
        {
            if (!Request.Headers.TryGetValue("userId", out var userIdHeader) ||
                !int.TryParse(userIdHeader.FirstOrDefault(), out int userId) || userId == 0)
                return Unauthorized(new ApiResponse<string> { Success = false, Message = "User not authenticated" });

            bool.TryParse(Request.Headers["isDirector"].FirstOrDefault(), out bool isDirector);
            
            try
            {
                var success = await _companyService.RevertFlagForReview(id, userId, isDirector);
                if (!success)
                    return BadRequest(new ApiResponse<string> { Success = false, Message = "Failed to flag for review" });

                return Ok(new ApiResponse<string> { Success = true, Message = "Flagged for director review successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string> { Success = false, Message = ex.Message });
            }
        }

        [HttpPut("{id}/mark-as-pending")]
        public async Task<ActionResult<ApiResponse<string>>> MarkAsPending(int id)
        {
            if (!Request.Headers.TryGetValue("userId", out var userIdHeader) ||
                !int.TryParse(userIdHeader.FirstOrDefault(), out int userId) || userId == 0)
                return Unauthorized(new ApiResponse<string> { Success = false, Message = "User not authenticated" });

            bool.TryParse(Request.Headers["isDirector"].FirstOrDefault(), out bool isDirector);

            var success = await _companyService.MarkAsPending(id, userId, isDirector);
            if (!success)
                return BadRequest(new ApiResponse<string> { Success = false, Message = "Failed to mark as pending" });

            return Ok(new ApiResponse<string> { Success = true, Message = "Company marked as pending successfully" });
        }
    }
}
