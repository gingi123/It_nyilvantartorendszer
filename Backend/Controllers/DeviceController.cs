using Google.Protobuf.WellKnownTypes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Org.BouncyCastle.Asn1.Cms;
using System.Data;
using System.Security.Claims;
using System.Text.Json;
using Vizsgaremek_backend_ASP.Database;
using Vizsgaremek_backend_ASP.Models;

namespace Vizsgaremek_backend_ASP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DeviceController : ControllerBase
    {
        private ItInventoryContext _context = new ItInventoryContext();




        /// /////////
        /// [Authorize]  innen jön mert a Tokenbe ezeket adtuk meg 
        /// Biztonsági okokból igy autentikálok a jövőben 
        /// Nincs token 401 Unauthorized
        /// Token érvényes, de nincs role	403 Forbidden
        ///   Token + role ok 200 OK


        [Authorize(Roles = "admin")]
        [HttpGet]
        public async Task<IActionResult> GetDevices()
        {
            ///  var name = User.FindFirst(ClaimTypes.Role)?.Value;       Role : Lekérdezése

            try
            {
                var devices = await _context.Devices.OrderBy(x => x.Id)
                .Include(x => x.DeviceType)
                .Select(device => new
                {
                    Id = device.Id,
                    DeviceTypeId = device.DeviceTypeId,
                    Manufacturer = device.Manufacturer,
                    Model = device.Model,
                    Serialnumber = device.SerialNumber,
                    Inventorynumber = device.InventoryNumber,
                    Status = device.Status,
                    Creadtedat = device.CreatedAt,
                    Updatedat = device.UpdatedAt,
                    DeviceType = device.DeviceType




                }).ToListAsync();

                if (devices.Count == 0)
                {
                    return BadRequest(devices);
                }
                return Ok(devices);
            }

            catch (Exception ex)
            {

                return BadRequest(ex.Message);

            }

        }




        [HttpGet("{id}")]
        //[Authorize(Roles = "admin")]
        public async Task<IActionResult> GetdeviceById(ulong id)
        {
            try
            {
                var device = await _context!.Devices
                    .Where(x => x.Id == id)
                    .Select(x => new
                    { 
                        x.Id,
                        x.Manufacturer,
                        x.Model,
                        DeviceType = x.DeviceType.Name,
                        x.SerialNumber,
                        x.InventoryNumber,
                        x.Status,
                        x.CreatedAt,
                        userGuide = x.DeviceFiles
                            .Where(x => x.FileType == "user_guide")
                            .Select(x => x.FilePath)
                            .FirstOrDefault(),
                        warranty = x.DeviceFiles
                            .Where(x => x.FileType == "warranty")
                            .Select(x => x.FilePath)
                            .FirstOrDefault(),
                        invoice = x.DeviceFiles
                            .Where(x => x.FileType == "invoice")
                            .Select(x => x.FilePath)
                            .FirstOrDefault(),
                        picture = x.DeviceFiles
                            .Where(x => x.FileType == "picture")
                            .Select(x => x.FilePath)
                            .FirstOrDefault()
                    }).FirstOrDefaultAsync();

                if (device == null)
                {
                    return NotFound();
                }
                return Ok(device);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }




        [HttpGet("{id}/files")]
        [Authorize(Roles = "admin")]

        public async Task<IActionResult> GetDeviceFilesByID(ulong id)
        {

            try
            {
                DeviceFile? deviceFile = await _context.DeviceFiles.FirstOrDefaultAsync(x => x.DeviceId == id);

                if (deviceFile == null)
                {
                    return NotFound();
                }

                return Ok(deviceFile);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }


        [HttpGet("my")]

        public async Task<IActionResult> GetDeviceMyByID(
        int pageNum = 1,
        int count = 10,
        string orderBy = "id",
        string orderDir = "asc",
        string search = "")
        {

            ulong userId = ulong.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            try
            {
                var query = _context.Assignments
                    .Where(x => x.UserId == userId && x.ReturnedAt == null)
                    .Include(x => x.Device)
                    .ThenInclude(x => x.DeviceType)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    string searchLower = search.Trim().ToLower();

                    query = query.Where(x =>
                        (x.Device.Manufacturer).ToLower().Contains(searchLower) ||
                        x.Device.Model.ToLower().Contains(searchLower) ||
                        x.Device.DeviceType.Name.ToLower().Contains(searchLower) ||
                        x.Device.SerialNumber.ToLower().Contains(searchLower) ||
                        x.Device.InventoryNumber.ToLower().Contains(searchLower)
                    );
                }

                query = (orderBy.ToLower(), orderDir.ToLower()) switch
                {
                    ("id", "asc") => query.OrderBy(x => x.Id),
                    ("id", "desc") => query.OrderByDescending(x => x.Id),

                    ("manufacturer", "asc") => query.OrderBy(x => x.Device.Manufacturer),
                    ("manufacturer", "desc") => query.OrderByDescending(x => x.Device.Manufacturer),

                    ("model", "asc") => query.OrderBy(x => x.Device.Model),
                    ("model", "desc") => query.OrderBy(x => x.Device.Model),

                    ("device_type", "asc") => query.OrderBy(x => x.Device.DeviceType.Name),
                    ("device_type", "desc") => query.OrderByDescending(x => x.Device.DeviceType.Name),

                    ("device_serial", "asc") => query.OrderBy(x => x.Device.SerialNumber),
                    ("device_serial", "desc") => query.OrderByDescending(x => x.Device.SerialNumber),

                    ("inventory_number", "asc") => query.OrderBy(x => x.Device.InventoryNumber),
                    ("inventory_number", "desc") => query.OrderByDescending(x => x.Device.InventoryNumber),

                    ("assignment_date", "asc") => query.OrderBy(x => x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt),
                    ("assignment_date", "desc") => query.OrderByDescending(x => x.ReturnedAt == null ? x.AssignedAt : x.ReturnedAt),

                    _ => query.OrderByDescending(x => x.AssignedAt)
                };

                int deviceCount = await query.CountAsync();

                var mydevice_ass = await query
                    .Skip((pageNum - 1) * count)
                    .Take(count)
                    .Select(ass => new
                    {
                        id = ass.Id,
                        //User_ID = ass.UserId,
                        //Device_id = ass.DeviceId,
                        //AssignedAt = ass.AssignedAt,
                        device = new
                        {
                            id = ass.Device.Id,
                            manufacturer = ass.Device.Manufacturer,
                            model = ass.Device.Model,
                            serialNumber = ass.Device.SerialNumber,
                            inventoryNumber = ass.Device.InventoryNumber,
                            name = ass.Device.DeviceType.Name,
                            assigned_At = ass.AssignedAt
                        },
                        // DeviceType = ass.Device.DeviceType.Name

                    }).ToListAsync();

                //if (mydevice_ass.Count == 0)
                //    return StatusCode(404, "Nem található több elem");

                int totalPages = deviceCount == 0 ? 1 : (int)Math.Ceiling(deviceCount / (double)count);

                int left = deviceCount - pageNum * count;
                if (left < 0)
                    left = 0;

                var deviceList = new
                {
                    device = mydevice_ass,
                    sumCount = deviceCount,
                    actPageCount = mydevice_ass.Count,
                    totalPages = totalPages,
                    left = left
                };

                return Ok(deviceList);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        /// 
        /// 
        ///     A PostNewDevice müködés : Az adatbázisban ugyan "snake_case"-el szerepelnek az oszlopok de az EFI ezt nem ismeri fel ezért
        ///     hozzáadásnál "CamelCase" megadásával kell beadni az értékeket minta:
        /// 
        ///      "deviceTypeId" : 5,
        ///      "manufacturer" : "Lenovo",
        ///      "model": "Thinpad T410",
        ///      "serialNumber" : "SN-DOC-000101",
        ///      "inventoryNumber" : "INV-DOC-000101",
        ///      "status" : "available"
        ///     
        ///      POSTMAN-ben tesztelve 2026.02.25  Elvárt Role = "admin"


        [HttpPost]
        [Authorize(Roles = "admin")]

        public async Task<IActionResult> PostNewDevice([FromBody] dynamic value)
        {

            try
            {
                Device? newDevice = JsonSerializer.Deserialize<Device>(value, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (newDevice == null)
                {
                    return BadRequest("JSON hiba");
                }
                _context.Devices.Add(newDevice);
                int affectedRow = await _context.SaveChangesAsync();
                if (affectedRow == 0)
                {
                    BadRequest("Eszköz létrehozása sikertelen volt.");
                }
                return Created();

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }




        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteDevice(ulong id)
        {

            try
            {

                Device? device = await _context.Devices.FirstOrDefaultAsync(x => x.Id == id);
                if (device == null)
                {
                    return NotFound($"A(z) {id} id vel nem található eszköz.");
                }
                List<Assignment>? assignment = await _context.Assignments.ToListAsync();
                foreach (var item in assignment)
                {
                    if (item.DeviceId == id && item.ReturnedAt == null)
                    {
                        return BadRequest("A(z) Eszköz nem törölhető mert ki van adva.");
                    }
                }
                List<DeviceFile> deviceFiles = await _context.DeviceFiles.ToListAsync();
                foreach (var item in deviceFiles)
                {
                    if (item.DeviceId == id)
                    {
                        _context.DeviceFiles.Remove(item);
                    }
                }
                List<Assignment> assignments = await _context.Assignments.ToListAsync();
                foreach (var item in assignments)
                {
                    if (item.DeviceId == id)
                    {
                        _context.Assignments.Remove(item);
                    }
                }
                _context.Devices.Remove(device);
                int affectedrow = await _context.SaveChangesAsync();
                if (affectedrow == 0)
                {
                    StatusCode(200, "Hiba a müvelet során a rekord nem került törlésre");
                }
                return Ok($"A(z) {id} id-vel az eszköz és a hozzátartozó összes fájl törlésre került.");

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }


        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]

        public async Task<IActionResult> PutDevice(ulong id, [FromBody] dynamic value)
        {

            try
            {

                Device? deviceExist = _context.Devices.FirstOrDefault(x => x.Id == id);
                if (deviceExist == null)
                {
                    return NotFound($"Ezzel az {id}-vel nem találató eszköz");
                }
                Device? newDevice = JsonSerializer.Deserialize<Device?>(value, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });


                if (newDevice.DeviceTypeId != 0)
                {
                    deviceExist.DeviceTypeId = newDevice.DeviceTypeId;
                }

                deviceExist.Manufacturer = newDevice?.Manufacturer ?? deviceExist.Manufacturer;
                deviceExist.Model = newDevice?.Model ?? deviceExist.Model;
                deviceExist.SerialNumber = newDevice?.SerialNumber ?? deviceExist.SerialNumber;
                deviceExist.InventoryNumber = newDevice?.InventoryNumber ?? deviceExist.InventoryNumber;
                deviceExist.Status = newDevice?.Status ?? deviceExist.Status;

                int affectedrow = await _context.SaveChangesAsync();
                if (affectedrow == 0)
                {
                    return BadRequest(new { error = "Hiba! Nem történt mentés az adatbázisban " });
                }
                return Ok($"Az {id}-es id-vel device frissitésre került.");



            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }



        [HttpPost("{id}/files")]
        [Authorize(Roles = "admin")]

        public async Task<IActionResult> PostDeiveFilesByID(ulong id,[FromBody] dynamic value)
        {


            try
            {

                Device? existdevice = await _context.Devices.FirstOrDefaultAsync(x => x.Id == id);
                if (existdevice == null)
                {
                    return NotFound();
                }

                DeviceFile? newDeviceFile = JsonSerializer.Deserialize<DeviceFile>(value, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (newDeviceFile == null)
                {
                    return BadRequest("JSON hiba");
                }
                _context.DeviceFiles.Add(newDeviceFile);
                int affectedRow = await _context.SaveChangesAsync();
                if (affectedRow == 0)
                {
                    BadRequest("Eszköz létrehozása sikertelen volt.");
                }
                return Created();

            }
            catch (Exception ex)
            {
               
                return BadRequest(ex.Message);
            }


        }








        [HttpDelete("files/{fileId}")]
        [Authorize(Roles = "admin")]

        public async Task<IActionResult> DeleteDeviceFilesByeId(ulong fileId)
        {

            try
            {
                DeviceFile? existedFile = await _context.DeviceFiles.FirstOrDefaultAsync(x => x.Id == fileId); 
                if (existedFile == null)
                {
                    return NotFound($"Az {fileId}-es id vel nem található fájl."); 
                }
                _context.DeviceFiles.Remove(existedFile);
                int affectedrow = await _context.SaveChangesAsync();
                if (affectedrow == 0)
                {
                    return StatusCode(200,$"Hiba a müvelet során rekord nem került törlésre");
                }
                return Ok($"Az {fileId}-es id a rekord törlésre került.");


            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }





        [HttpGet("page-to-page")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetDevicePageByPage(
             int page = 1,
             int count = 10,
             string orderBy = "id",
             string orderDir = "asc",
             string search = "")
        {
            try
            {
                if (count <= 0)
                    return BadRequest("A lekérdezett elemszám nem lehet 0 vagy negatív.");

                var query = _context.Devices
                    .Include(x => x.DeviceType)
                    .AsQueryable();

                // Keresés
                if (!string.IsNullOrWhiteSpace(search))
                {
                    search = search.Trim().ToLower();

                    query = query.Where(x =>
                        x.Manufacturer.ToLower().Contains(search) ||
                        x.Model.ToLower().Contains(search) ||
                        x.SerialNumber.ToLower().Contains(search) ||
                        x.InventoryNumber.ToLower().Contains(search) ||
                        x.DeviceType.Name.ToLower().Contains(search) ||

                        x.Status.ToLower().Contains(search) ||

                        (search.Contains("kiadva") && x.Status == "assigned") ||
                        (search.Contains("kiadható") && x.Status == "available") ||
                        (search.Contains("nem kiadható") && x.Status == "unavailable")
                    );
                }

                // Rendezés
                bool asc = orderDir.ToLower() == "asc";

                query = orderBy.ToLower() switch
                {
                    "id" => asc ? query.OrderBy(x => x.Id) : query.OrderByDescending(x => x.Id),
                    "manufacturer" => asc ? query.OrderBy(x => x.Manufacturer) : query.OrderByDescending(x => x.Manufacturer),
                    "model" => asc ? query.OrderBy(x => x.Model) : query.OrderByDescending(x => x.Model),
                    "device_type" => asc ? query.OrderBy(x => x.DeviceType.Name) : query.OrderByDescending(x => x.DeviceType.Name),
                    "device_serial" => asc ? query.OrderBy(x => x.SerialNumber) : query.OrderByDescending(x => x.SerialNumber),
                    "inventory_number" => asc ? query.OrderBy(x => x.InventoryNumber) : query.OrderByDescending(x => x.InventoryNumber),
                    "status" => asc ? query.OrderBy(x => x.Status) : query.OrderByDescending(x => x.Status),
                    "createdat" => asc ? query.OrderBy(x => x.CreatedAt) : query.OrderByDescending(x => x.CreatedAt),
                    "updatedat" => asc ? query.OrderBy(x => x.UpdatedAt) : query.OrderByDescending(x => x.UpdatedAt),
                    _ => asc ? query.OrderBy(x => x.Id) : query.OrderByDescending(x => x.Id)
                };

                int allAmountOfDevice = await query.CountAsync();

                var actualDevices = await query
                    .Skip((page - 1) * count)
                    .Take(count)
                    .Select(x => new
                    {
                        x.Id,
                        x.Manufacturer,
                        x.Model,
                        x.SerialNumber,
                        x.InventoryNumber,
                        x.Status,
                        x.CreatedAt,
                        x.UpdatedAt,
                        DeviceType = x.DeviceType.Name,
                        DeviceTypeid = x.DeviceType.Id
                    })
                    .ToListAsync();

                double totalPage = Math.Ceiling(allAmountOfDevice / (double)count);
                int devicesLeft = Math.Max(0, allAmountOfDevice - (count * page));

                var dataBack = new
                {
                    totalPage,
                    allAmountOfDevice,
                    totalDevice = allAmountOfDevice,
                    devicesLeft,
                    actualDevices
                };

                return Ok(dataBack);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpGet("device-search")]
        public async Task<IActionResult> DeviceSearch(string search)
        {
            int limit = 5;
            try
            {
                var query = _context.Devices.Where(x => x.Status == "available").AsQueryable();

                if (!String.IsNullOrWhiteSpace(search))
                {
                    string searchLower = search.Trim().ToLower();

                    query = query.Where(x =>
                    x.Manufacturer.ToLower().Contains(searchLower) ||
                    x.Model.ToLower().Contains(searchLower) ||
                    x.SerialNumber.ToLower().Contains(searchLower) ||
                    x.InventoryNumber.ToLower().Contains(searchLower))
                        .OrderBy(x => x.InventoryNumber);
                }
                var devices = await query.Take(limit).Select(x => new
                {
                    value = x.Id,
                    manufacturer = x.Manufacturer,
                    model = x.Model,
                    serialNumber = x.SerialNumber,
                    inventoryNumber = x.InventoryNumber,
                    deviceType = x.DeviceType.Name

                }).ToListAsync();

                return Ok(devices);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    } 
}
