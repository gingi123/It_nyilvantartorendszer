using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using Vizsgaremek_backend_ASP.Database;
using Vizsgaremek_backend_ASP.Models;

namespace Vizsgaremek_backend_ASP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AssignmentController : ControllerBase
    {
        private ItInventoryContext _context = new ItInventoryContext();

        [Authorize(Roles = "admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllAssignments(
        int pageNum = 1,
        int count = 10,
        string orderBy = "id",
        string orderDir = "asc",
        string search = "")
        {
            
            try
            {
                var query = _context.Assignments.AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    string searchLower = search.Trim().ToLower();

                    query = query.Where(x =>
                        (x.User.LastName + " " + x.User.FirstName).ToLower().Contains(searchLower) ||
                        x.Device.SerialNumber.ToLower().Contains(searchLower) ||
                        x.Device.DeviceType.Name.ToLower().Contains(searchLower) ||
                        (x.ReturnedAt == null && "kiadás".Contains(searchLower)) ||
                        (x.ReturnedAt != null && "visszavétel".Contains(searchLower))
                    );
                }

                query = (orderBy.ToLower(), orderDir.ToLower()) switch
                {
                    ("id", "asc") => query.OrderBy(x => x.Id),
                    ("id", "desc") => query.OrderByDescending(x => x.Id),

                    ("user", "asc") => query.OrderBy(x => x.User.LastName).ThenBy(x => x.User.FirstName),
                    ("user", "desc") => query.OrderByDescending(x => x.User.LastName).ThenByDescending(x => x.User.FirstName),

                    ("device_serial", "asc") => query.OrderBy(x => x.Device.SerialNumber),
                    ("device_serial", "desc") => query.OrderByDescending(x => x.Device.SerialNumber),

                    ("device_type", "asc") => query.OrderBy(x => x.Device.DeviceType.Name),
                    ("device_type", "desc") => query.OrderByDescending(x => x.Device.DeviceType.Name),

                    ("assignment_type", "asc") => query.OrderBy(x => x.ReturnedAt == null ? "Assignment" : "Return"),
                    ("assignment_type", "desc") => query.OrderByDescending(x => x.ReturnedAt == null ? "Assignment" : "Return"),

                    ("assignment_date", "asc") => query.OrderBy(x => x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt),
                    ("assignment_date", "desc") => query.OrderByDescending(x => x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt),

                    _ => query.OrderByDescending(x => x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt)
                };

                int assignmentCount = await query.CountAsync();

                var myAssignments = await query
                    .Skip((pageNum - 1) * count)
                    .Take(count)
                    .Select(x => new
                    {
                        id = x.Id,
                        user = x.User.LastName + " " + x.User.FirstName,
                        device_serial = x.Device.SerialNumber,
                        device_type = x.Device.DeviceType.Name,
                        assignment_type = x.ReturnedAt == null ? "Assignment" : "Return",
                        assignment_date = x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt
                    })
                    .ToListAsync();

                //if (myAssignments.Count == 0)
                //    return StatusCode(404, "Nem található több elem");

                int totalPages = assignmentCount == 0 ? 1 : (int)Math.Ceiling(assignmentCount / (double)count);

                int left = assignmentCount - pageNum * count;
                if (left < 0)
                    left = 0;

                var assigmentList = new
                {
                    myAssignments,
                    sumCount = assignmentCount,
                    actPageCount = myAssignments.Count,
                    totalPages = totalPages,
                    left = left
                };

                return Ok(assigmentList);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyAssignments(
        int pageNum = 1,
        int count = 10,
        string orderBy = "id",
        string orderDir = "asc",
        string search = "")
        {
            ulong userId = ulong.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            try
            {
                var query = _context.Assignments.Where(x => x.UserId == userId);

                if (!string.IsNullOrWhiteSpace(search))
                {
                    string searchLower = search.Trim().ToLower();

                    query = query.Where(x =>
                        (x.User.LastName + " " + x.User.FirstName).ToLower().Contains(searchLower) ||
                        x.Device.SerialNumber.ToLower().Contains(searchLower) ||
                        x.Device.DeviceType.Name.ToLower().Contains(searchLower) ||
                        (x.ReturnedAt == null && "kiadás".Contains(searchLower)) ||
                        (x.ReturnedAt != null && "visszavétel".Contains(searchLower))
                    );
                }

                query = (orderBy.ToLower(), orderDir.ToLower()) switch
                {
                    ("id", "asc") => query.OrderBy(x => x.Id),
                    ("id", "desc") => query.OrderByDescending(x => x.Id),

                    ("user", "asc") => query.OrderBy(x => x.User.LastName).ThenBy(x => x.User.FirstName),
                    ("user", "desc") => query.OrderByDescending(x => x.User.LastName).ThenByDescending(x => x.User.FirstName),

                    ("device_serial", "asc") => query.OrderBy(x => x.Device.SerialNumber),
                    ("device_serial", "desc") => query.OrderByDescending(x => x.Device.SerialNumber),

                    ("device_type", "asc") => query.OrderBy(x => x.Device.DeviceType.Name),
                    ("device_type", "desc") => query.OrderByDescending(x => x.Device.DeviceType.Name),

                    ("assignment_type", "asc") => query.OrderBy(x => x.ReturnedAt == null ? "Assignment" : "Return"),
                    ("assignment_type", "desc") => query.OrderByDescending(x => x.ReturnedAt == null ? "Assignment" : "Return"),

                    ("assignment_date", "asc") => query.OrderBy(x => x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt),
                    ("assignment_date", "desc") => query.OrderByDescending(x => x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt),

                    _ => query.OrderByDescending(x => x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt)
                };

                int assignmentCount = await query.CountAsync();

                var myAssignments = await query
                    .Skip((pageNum - 1) * count)
                    .Take(count)
                    .Select(x => new
                    {
                        id = x.Id,
                        user = x.User.LastName + " " + x.User.FirstName,
                        device_serial = x.Device.SerialNumber,
                        device_type = x.Device.DeviceType.Name,
                        assignment_type = x.ReturnedAt == null ? "Assignment" : "Return",
                        assignment_date = x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt
                    })
                    .ToListAsync();

                //if (myAssignments.Count == 0)
                //    return StatusCode(404, "Nem található több elem");

                int totalPages = assignmentCount == 0 ? 1 : (int)Math.Ceiling(assignmentCount / (double)count);

                int left = assignmentCount - pageNum * count;
                if (left < 0)
                    left = 0;

                var assigmentList = new
                {
                    myAssignments,
                    sumCount = assignmentCount,
                    actPageCount = myAssignments.Count,
                    totalPages = totalPages,
                    left = left
                };

                return Ok(assigmentList);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpGet("{id}")]

        public async Task<IActionResult> GetAssignmentDetails(ulong id)
        {
            try
            {
                var assigmentDetails = await _context.Assignments.Where(x => x.Id == id)
                    .Include(x => x.Device)
                    .ThenInclude(x => x.DeviceType)
                    .Select(x => new
                    {
                        id = x.Id,
                        userId = x.User.Id,
                        user = x.User.LastName + " " + x.User.FirstName,
                        deviceId = x.DeviceId,
                        device_manufacturer = x.Device.Manufacturer,
                        device_model = x.Device.Model,
                        device_type = x.Device.DeviceType.Name,
                        device_serial = x.Device.SerialNumber,
                        device_inventoryno = x.Device.InventoryNumber,
                        assignment_type = x.ReturnedAt == null ? "Assignment" : "Return",
                        assignment_date = x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt
                    }).FirstOrDefaultAsync();
                if (assigmentDetails == null)
                    return NotFound();
                return Ok(assigmentDetails);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("my/{id}")]
        public async Task<IActionResult> GetMyAssignmentDetails(ulong id)
        {
            ulong userId = ulong.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            try
            {
                var assigmentDetails = await _context.Assignments.Where(x => x.UserId == userId && x.Id == id)
                    .Include(x => x.Device)
                    .ThenInclude(x => x.DeviceType)
                    .Select(x => new
                {
                    id = x.Id,
                    user = x.User.LastName + " " + x.User.FirstName,
                    device_manufacturer = x.Device.Manufacturer,
                    device_model = x.Device.Model,
                    device_type = x.Device.DeviceType.Name,
                    device_serial = x.Device.SerialNumber,
                    device_inventoryno = x.Device.InventoryNumber,
                    assignment_type = x.ReturnedAt == null ? "Assignment" : "Return",
                    assignment_date = x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt
                }).FirstOrDefaultAsync();
                if (assigmentDetails == null)
                    return NotFound();
                return Ok(assigmentDetails);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<IActionResult> NewAssignment([FromBody] dynamic value)
        {
            try
            {
                JsonElement inputJson = (JsonElement)value;
                if (!inputJson.TryGetProperty("userId", out var userIdProp) ||
                    !inputJson.TryGetProperty("deviceId", out var deviceIdProp))
                    return BadRequest("A JSON állomány hibás");

                ulong userId = userIdProp.GetUInt64();
                ulong deviceId = deviceIdProp.GetUInt64();

                var device = await _context.Devices.FirstOrDefaultAsync(x => x.Id == deviceId);
                if (device == null)
                    return NotFound("Nincs ilyen eszköz");
                if (device.Status != "available")
                    return BadRequest("Az eszköz nem elérhető");

                var e = new Assignment
                {
                    UserId = userId,
                    DeviceId = deviceId,
                    AssignedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Assignments.Add(e);
                device.Status = "assigned";
                device.UpdatedAt = DateTime.UtcNow;
                int rowAffected = await _context.SaveChangesAsync();
                if (rowAffected == 0)
                    return BadRequest("Az eszközkiadás sikertelen volt");
                return Created($"{e.Id}", new
                {
                    e.Id,
                    e.UserId,
                    e.DeviceId,
                    e.AssignedAt,
                    e.ReturnedAt,
                    e.CreatedAt,
                    e.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPatch("{id}/return")]
        public async Task<IActionResult> ReturnDevice(ulong id)
        {
            try
            {
                Assignment? assignment = await _context.Assignments.FirstOrDefaultAsync(x => x.Id == id);
                if (assignment == null)
                    return NotFound("Nincs ilyen kiadás");
                if (assignment.ReturnedAt != null)
                    return Conflict("Az eszköz már vissza lett véve.");
                var deviceId = assignment.DeviceId;
                var device = await _context.Devices.FirstOrDefaultAsync(x => x.Id == deviceId);
                if (device == null)
                    return NotFound("Nincs ilyen kiadott eszköz");
                var now = DateTime.UtcNow;
                assignment.ReturnedAt = now;
                device.Status = "available";
                device.UpdatedAt = now;
                int rowsAffected = await _context.SaveChangesAsync();
                if (rowsAffected == 0)
                    return BadRequest("Az eszköz visszavétel sikertelen volt.");
                return Ok(new { message = "Az eszköz visszavétele sikeres volt." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPatch("{id}/edit")]
        public async Task<IActionResult> EditAssignment(ulong id, [FromBody] dynamic value)
        {
            try
            {
                Assignment? assignment = await _context.Assignments.FirstOrDefaultAsync(x => x.Id == id);
                if (assignment == null)
                    return NotFound("Nincs ilyen mozgás");

                JsonElement inputJson = (JsonElement)value;
                if (!inputJson.TryGetProperty("userId", out var userIdProp) ||
                    !inputJson.TryGetProperty("deviceId", out var deviceIdProp))
                    return BadRequest("A JSON állomány hibás");

                ulong userId = userIdProp.GetUInt64();
                ulong deviceId = deviceIdProp.GetUInt64();

                User? user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
                if (user == null)
                    return NotFound("Nincs ilyen felhasználó");

                var newDevice = await _context.Devices.FirstOrDefaultAsync(x => x.Id == deviceId);
                if (newDevice == null)
                    return NotFound("Nincs ilyen eszköz");

                if (assignment.DeviceId != deviceId)
                {
                    if (newDevice.Status != "available")
                        return BadRequest("Az eszköz nem elérhető");

                    var oldDevice = await _context.Devices.FirstOrDefaultAsync(x => x.Id == assignment.DeviceId);
                    if (oldDevice != null)
                    {
                        oldDevice.Status = "available";
                        oldDevice.UpdatedAt = DateTime.UtcNow;
                    }

                    newDevice.Status = "assigned";
                    newDevice.UpdatedAt = DateTime.UtcNow;
                }

                assignment.DeviceId = deviceId;
                assignment.UserId = userId;

                await _context.SaveChangesAsync();

                return Ok(new { message = "A mozgás módosításra került" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [Authorize(Roles = "admin")]
        [HttpGet("last-five-assignments")]
        public async Task<IActionResult> GetLastFive()
        {
            try
            {
                var assignments = await _context.Assignments.Select(x => new
                {
                    id = x.Id,
                    user = x.User.LastName + " " + x.User.FirstName,
                    device_serial = x.Device.SerialNumber,
                    device_type = x.Device.DeviceType.Name,
                    assignment_type = x.ReturnedAt == null ? "Assignment" : "Return",
                    assignment_date = x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt
                }).OrderByDescending(x => x.assignment_date)
                .Take(5)
                .ToListAsync();
                if (assignments.Count == 0)
                    return Ok(assignments);
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("my/last-five-assignments")]
        public async Task<IActionResult> GetMyLastFive(ulong id)
        {
            ulong userId = ulong.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            try
            {
                var assignments = await _context.Assignments
                    .Where(x => x.UserId == userId)
                    .Select(x => new
                {
                    id = x.Id,
                    user = x.User.LastName + " " + x.User.FirstName,
                    device_serial = x.Device.SerialNumber,
                    device_type = x.Device.DeviceType.Name,
                    assignment_type = x.ReturnedAt == null ? "Assignment" : "Return",
                    assignment_date = x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt
                }).OrderByDescending(x => x.assignment_date)
                .Take(5)
                .ToListAsync();
                if (assignments.Count == 0)
                    return Ok(assignments);
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}/delete")]
        public async Task<IActionResult> DeleteAssignment(ulong id)
        {
            try
            {
                Assignment? assignmentToDelete = await _context.Assignments.FirstOrDefaultAsync(x => x.Id == id);
                if (assignmentToDelete == null)
                    return NotFound("Nincs ilyen mozgás");
                if (assignmentToDelete.ReturnedAt != null)
                    return BadRequest("A mozgás nem törölhető");
                Device? deviceToUpdate = await _context.Devices.FirstOrDefaultAsync(x => x.Id == assignmentToDelete.DeviceId);
                if (deviceToUpdate == null)
                    return NotFound("Nincs ilyen eszköz");
                if (deviceToUpdate.Status != "assigned")
                    return BadRequest("Nem megfelelő az eszköz státusza");
                deviceToUpdate.Status = "available";
                deviceToUpdate.UpdatedAt = DateTime.UtcNow;
                _context.Assignments.Remove(assignmentToDelete);
                int rowAffected = await _context.SaveChangesAsync();
                if (rowAffected == 0)
                    return BadRequest("Nem sikerült a mentés");
                return Ok(new { message = "Sikeres törlés" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
