using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Vizsgaremek_backend_ASP.Database;

namespace Vizsgaremek_backend_ASP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportController : ControllerBase
    {
        private ItInventoryContext _context = new ItInventoryContext();

        [Authorize(Roles = "admin")]
        [HttpGet("status-summary")]
        public async Task<IActionResult> GetStatusSummary()
        {
            try
            {
                var summary = await _context.Devices.GroupBy(x => x.Status).Select(x => new
                {
                    Status = x.Key,
                    Count = x.Count()
                }).ToListAsync();
                if (summary.Count == 0)
                    return Ok(summary);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpGet("by-type")]
        public async Task<IActionResult> GetReportByType()
        {
            try
            {
                var devicesByType = await _context.Devices.GroupBy(x => new { x.DeviceTypeId, x.DeviceType.Name })
                    .Select(x => new
                    {
                        name = x.Key.Name,
                        value = x.Count()
                    }).ToListAsync();
                if (devicesByType.Count == 0)
                    return Ok(devicesByType);
                return Ok(devicesByType);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpGet("by-status")]
        public async Task<IActionResult> GetReportByStatus()
        {
            try
            {
                var devicesByStatus = await _context.Devices.GroupBy(x => x.Status).Select(x => new
                {
                    name = x.Key,
                    value = x.Count()
                }).ToListAsync();
                if (devicesByStatus.Count == 0)
                    return Ok(devicesByStatus);
                return Ok(devicesByStatus);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpGet("by-user")]
        public async Task<IActionResult> GetReportByUser()
        {
            try
            {
                var usersByRole = await _context.Users.GroupBy(x => x.Role).Select(x => new
                    {
                        name = x.Key,
                        value = x.Count()
                    }).ToListAsync();
                if (usersByRole.Count == 0)
                    return Ok(usersByRole);
                return Ok(usersByRole);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpGet("by-direction")]
        public async Task<IActionResult> GetReportByAssignment()
        {
            try
            {
                var assignmentsByDirection = await _context.Assignments
                    .GroupBy(x => x.ReturnedAt == null ? "Kiadás" : "Visszavétel")
                    .Select(x => new
                    {
                        name = x.Key,
                        value = x.Count()
                    })
                    .ToListAsync();
                return Ok(assignmentsByDirection);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("me/device-type-summary")]
        public async Task<IActionResult> MyDeviceTypeSummary()
        {
            ulong userId = ulong.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            try
            {
                var summary = await _context.Assignments
                    .Where(x => x.UserId == userId && x.ReturnedAt == null)
                    .Select(x => new
                    {
                        TypeId = x.Device.DeviceType.Id,
                        TypeName = x.Device.DeviceType.Name
                    })
                    .GroupBy(x => new { x.TypeId, x.TypeName }).Select(x => new
                {
                    TypeId = x.Key.TypeId,
                    Type = x.Key.TypeName,
                    Count = x.Count()
                }).ToListAsync();
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("me/device-type-report")] 
        public async Task<IActionResult> MyDeviceTypeReport()
        {
            ulong userId = ulong.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            try
            {
                var report = await _context.Assignments
                    .Where(x => x.UserId == userId && x.ReturnedAt == null)
                    .Select(x => new
                    {
                     TypeId = x.Device.DeviceType.Id,
                     TypeName = x.Device.DeviceType.Name
                    })
                    .GroupBy(x => new { x.TypeId, x.TypeName }).Select(x => new
                    {
                        name = x.Key.TypeName,
                        value = x.Count()
                    }).ToListAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("me/device-manufacturer-report")]
        public async Task<IActionResult> MyDeviceManufacturerReport()
        {
            ulong userId = ulong.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            try
            {
                var report = await _context.Assignments
                    .Where(x => x.UserId == userId && x.ReturnedAt == null)
                    .GroupBy(x => x.Device.Manufacturer)
                    .Select(x => new
                    {
                        name = x.Key,
                        value = x.Count()
                    })
                    .ToListAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("me/assignment-device-type-report")]
        public async Task<IActionResult> MyAssignmentDeviceTypeReport()
        {
            ulong userId = ulong.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            try
            {
                var report = await _context.Assignments
                    .Where(x => x.UserId == userId)
                    .GroupBy(x => x.Device.DeviceType.Name)
                    .Select(x => new
                    {
                        name = x.Key,
                        value = x.Count()
                    })
                    .ToListAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("me/assignment-direction-type-report")]
        public async Task<IActionResult> MyAssignmentDirectionTypeReport()
        {
            ulong userId = ulong.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            try
            {
                var report = await _context.Assignments
                    .Where(x => x.UserId == userId)
                    .GroupBy(x => x.ReturnedAt == null ? "Kiadott" : "Visszavett")
                    .Select(x => new
                    {
                        name = x.Key,
                        value = x.Count()
                    })
                    .ToListAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
