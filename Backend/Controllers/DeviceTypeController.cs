using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Vizsgaremek_backend_ASP.Database;
using Vizsgaremek_backend_ASP.Models;

namespace Vizsgaremek_backend_ASP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DeviceTypeController : ControllerBase
    {
        private ItInventoryContext _context = new ItInventoryContext();

        [HttpGet]
        public async Task<IActionResult> GetDeviceTypes()
        {
            try
            {
                var deviceTypes = await _context.DeviceTypes.Include(x => x.Devices).Select(x => new
                {
                    id = x.Id,
                    name = x.Name,
                    deviceCount = x.Devices.Count()
                }).ToListAsync();
                if (deviceTypes.Count == 0)
                    return Ok(deviceTypes);
                return Ok(deviceTypes);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<IActionResult> AddDeviceType([FromBody] dynamic value)
        {
            try
            {
                DeviceType? devicetype = JsonSerializer.Deserialize<DeviceType>(value, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (devicetype == null)
                    return BadRequest("A JSON állomány hibás");
                _context.Add(devicetype);
                int rowAffected = await _context.SaveChangesAsync();
                if (rowAffected == 0)
                    return BadRequest("Az eszköztípus hozzáadása sikertelen volt");
                return Ok("Az eszköztípus hozzáadása megtörtént");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> EditDeviceType(ulong id, [FromBody] dynamic value)
        {
            try
            {
                DeviceType? existedDeviceType = await _context.DeviceTypes.FindAsync(id);
                if (existedDeviceType == null)
                    return NotFound("Ilyen eszköztípus nem létezik");
                DeviceType? deviceType = JsonSerializer.Deserialize<DeviceType>(value, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (deviceType == null)
                    return BadRequest("A JSON hibás");
                existedDeviceType.Name = deviceType.Name ?? existedDeviceType.Name;

                int rowAffected = await _context.SaveChangesAsync();
                if (rowAffected == 0)
                    return BadRequest(new { error = "Nem történt változás." });
                return Ok("Az eszköztípus módosítása megtörtént.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]

        public async Task<IActionResult> DeleteDeviceType(ulong id)
        {
            try
            {

                List<Device>? deviceWithThisType = await _context.Devices.Where(x => x.DeviceTypeId == id).ToListAsync();
                if (deviceWithThisType.Count != 0)
                {
                    return BadRequest("Eszköztypus nem törölhető mert eszközök vannak hozzá kötve");
                }
                DeviceType? deviceTypeToDelete = await _context.DeviceTypes.FindAsync(id);
                if (deviceTypeToDelete == null)
                {
                    return NotFound($"Ezzel az {id}-idvel nem található Eszköztipus");
                }
                _context.DeviceTypes.Remove(deviceTypeToDelete);
                int affectedrow = await _context.SaveChangesAsync();
                if(affectedrow == 0)
                {
                    return BadRequest("Hiba a törlés során");
                }
                return Ok($"Az {id}-idvel Eszköz típus törlésre került.s");

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }




    }
}
