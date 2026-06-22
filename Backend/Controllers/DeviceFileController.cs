using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Vizsgaremek_backend_ASP.Database;
using Vizsgaremek_backend_ASP.Models;

namespace Vizsgaremek_backend_ASP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DeviceFileController : ControllerBase
    {
        private readonly ItInventoryContext _context;
        private readonly IWebHostEnvironment _environment;

        public DeviceFileController(ItInventoryContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [Authorize(Roles = "admin")]
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(50_000_000)]
        public async Task<IActionResult> UploadFiles(
           [FromForm] ulong deviceId,
           IFormFile? userGuide,
           IFormFile? invoice,
           IFormFile? warranty,
           IFormFile? picture)
        {
            try
            {
                var deviceExists = _context.Devices.Any(d => d.Id == deviceId);
                if (!deviceExists)
                    return NotFound("A megadott eszköz nem található.");

                var webRoot = _environment.WebRootPath;
                if (string.IsNullOrWhiteSpace(webRoot))
                {
                    webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                }

                var uploadRoot = Path.Combine(
                    webRoot,
                    "uploads",
                    "devices",
                    deviceId.ToString()
                );

                Directory.CreateDirectory(uploadRoot);

                var results = new List<object>();

                if (userGuide != null)
                    results.Add(await UpsertFile(userGuide, deviceId, "user_guide", uploadRoot));

                if (invoice != null)
                    results.Add(await UpsertFile(invoice, deviceId, "invoice", uploadRoot));

                if (warranty != null)
                    results.Add(await UpsertFile(warranty, deviceId, "warranty", uploadRoot));

                if (picture != null)
                    results.Add(await UpsertFile(picture, deviceId, "picture", uploadRoot));

                if (results.Count == 0)
                    return BadRequest("Nem érkezett feltöltendő fájl.");

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Fájlok mentése sikeres.",
                    files = results
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Hiba a feltöltés közben: {ex.Message}");
            }
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{deviceId}/{fileType}")]
        public async Task<IActionResult> DeleteFile(ulong deviceId, string fileType)
        {
            fileType = fileType.ToLowerInvariant();

            var existing = _context.DeviceFiles
                .FirstOrDefault(x => x.DeviceId == deviceId && x.FileType == fileType);

            if (existing == null)
                return NotFound("Nincs ilyen fájl.");

            var webRoot = _environment.WebRootPath;

            if (string.IsNullOrWhiteSpace(webRoot))
            {
                webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }


            var physicalPath = Path.Combine(
                webRoot,
                existing.FilePath.Replace("/", Path.DirectorySeparatorChar.ToString())
            );

            if (System.IO.File.Exists(physicalPath))
            {
                System.IO.File.Delete(physicalPath);
            }

            _context.DeviceFiles.Remove(existing);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Fájl törölve." });
        }

        private async Task<object> UpsertFile(IFormFile file, ulong deviceId, string fileType, string uploadRoot)
        {
            ValidateFile(file, fileType);

            var existing = _context.DeviceFiles
                .FirstOrDefault(x => x.DeviceId == deviceId && x.FileType == fileType);

            if (existing != null)
            {
                var oldPhysicalPath = Path.Combine(
                    _environment.WebRootPath ?? "wwwroot",
                    existing.FilePath.Replace("/", Path.DirectorySeparatorChar.ToString())
                );

                if (System.IO.File.Exists(oldPhysicalPath))
                {
                    System.IO.File.Delete(oldPhysicalPath);
                }
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var generatedFileName = $"{Guid.NewGuid()}{extension}";
            var fullPath = Path.Combine(uploadRoot, generatedFileName);

            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = Path.Combine("uploads", "devices", deviceId.ToString(), generatedFileName)
                .Replace("\\", "/");

            if (existing == null)
            {
                existing = new DeviceFile
                {
                    DeviceId = deviceId,
                    FileType = fileType,
                    FilePath = relativePath,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.DeviceFiles.Add(existing);
            }
            else
            {
                existing.FilePath = relativePath;
                existing.UpdatedAt = DateTime.UtcNow;
            }

            return new
            {
                deviceId = existing.DeviceId,
                fileType = existing.FileType,
                filePath = existing.FilePath
            };
        }

        private void ValidateFile(IFormFile file, string fileType)
        {
            if (file.Length <= 0)
                throw new Exception("Üres fájl nem tölthető fel.");

            if (file.Length > 10 * 1024 * 1024)
                throw new Exception("A fájl túl nagy.");

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var contentType = file.ContentType.ToLowerInvariant();

            string[] allowedExtensions;
            string[] allowedContentTypes;

            switch (fileType)
            {
                case "picture":
                    allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                    allowedContentTypes = new[] { "image/jpeg", "image/png", "image/webp" };
                    break;

                case "invoice":
                case "user_guide":
                case "warranty":
                    allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
                    allowedContentTypes = new[]
                    {
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            };
                    break;

                default:
                    throw new Exception("Ismeretlen fájltípus.");
            }

            if (!allowedExtensions.Contains(extension))
                throw new Exception($"Nem támogatott kiterjesztés: {extension}");

            if (!allowedContentTypes.Contains(contentType))
                throw new Exception($"Nem támogatott MIME típus: {contentType}");
        }
    }
}
