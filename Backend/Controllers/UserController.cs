using BCrypt.Net;
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
    public class UserController : ControllerBase
    {
        private ItInventoryContext _context = new ItInventoryContext();

        [Authorize(Roles = "admin")]
        [HttpGet]

        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _context.Users.Select(x => new
                {
                    id = x.Id,
                    username = x.Username,
                    email = x.Email,
                    firstname = x.FirstName,
                    lastname = x.LastName,
                    role = x.Role
                }).ToListAsync();
                if (users.Count == 0)
                    return Ok(users);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserDataAdmin(ulong id)
        {
            try
            {
                User? user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);
                if (user == null)
                    return NotFound("Nincs ilyen felhasználó");
                var userData = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    firstname = user.FirstName,
                    lastname = user.LastName,
                    role = user.Role,
                    createdat = user.CreatedAt,
                    updatedat = user.UpdatedAt
                };
                return Ok(userData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetUserData()
        {
            ulong userId = ulong.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            try
            {
                var myUserData = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
                if (myUserData == null)
                    return NotFound();
                var e = new { 
                    id = myUserData.Id,
                    username = myUserData.Username,
                    email = myUserData.Email,
                    firstname = myUserData.FirstName,
                    lastname = myUserData.LastName,
                    role = myUserData.Role,
                    createdat = myUserData.CreatedAt,
                    updatedat = myUserData.UpdatedAt
                };
                return Ok(e);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin")]
        [HttpPost("new-user")]
        public async Task<IActionResult> CreateUser([FromBody] dynamic value)
        {
            try
            {
                User? user = JsonSerializer.Deserialize<User>(value, new JsonSerializerOptions { PropertyNameCaseInsensitive = true} );
                if (user == null)
                    return BadRequest("A JSON állomány hibás!");
                var e = new User
                {
                    Username = user.Username,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash),
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role,
                    //CreatedAt = DateTime.Now,    
                    //UpdatedAt = DateTime.Now
                };
                _context.Users.Add(e);
                int rowaffected = await _context.SaveChangesAsync();
                if (rowaffected == 0)
                    return BadRequest("A felhasználó hozzáadása sikertelen volt");
                return Created($"{e.Id}", new
                {
                    e.Id,
                    e.Username,
                    e.Email,
                    e.FirstName,
                    e.LastName,
                    e.Role,
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
        [HttpPut("{id}")]

        public async Task<IActionResult> EditUser(ulong id, [FromBody] dynamic value)
        {
            try
            {
                User? existedUser = await _context.Users.FindAsync(id);
                if (existedUser == null)
                    return NotFound("Ilyen felhasználó nem létezik!");
                User? user = JsonSerializer.Deserialize<User?>(value, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (user == null)
                    return BadRequest("A JSON hibás");
                existedUser.Username = user.Username ?? existedUser.Username;
                if (!string.IsNullOrWhiteSpace(user.PasswordHash))
                    existedUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
                existedUser.Email = user.Email ?? existedUser.Email;
                existedUser.FirstName = user.FirstName ?? existedUser.FirstName;
                existedUser.LastName = user.LastName ?? existedUser.LastName;
                existedUser.Role = user.Role ?? existedUser.Role;
                existedUser.CreatedAt = existedUser.CreatedAt;
                existedUser.UpdatedAt = DateTime.UtcNow;

                int rowAffected = await _context.SaveChangesAsync();
                if (rowAffected == 0)
                    return BadRequest(new {error = "Nem történt változás."});
                return Ok("A felhasználó módosítás megtörtént.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("me/password")]
        public async Task<IActionResult> ChangePassword([FromBody] System.Text.Json.JsonElement value)
        {
            ulong userId = ulong.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            try
            {
                User? existedUser = await _context.Users.FindAsync(userId);
                if (existedUser == null)
                    return NotFound("Ilyen felhasználó nem létezik!");

                Dictionary<string, string>? passwords = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(value.GetRawText(), new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (passwords == null || !passwords.ContainsKey("currentPassword") || !passwords.ContainsKey("newPassword"))
                    return BadRequest("A JSON hibás");
                string currentPassword = passwords["currentPassword"];
                string newPassword = passwords["newPassword"];
                if (string.IsNullOrWhiteSpace(currentPassword) || string.IsNullOrWhiteSpace(newPassword))
                    return BadRequest(new { error = "A jelszavak kötelezőek" });
                if (!BCrypt.Net.BCrypt.Verify(currentPassword, existedUser.PasswordHash))
                    return BadRequest(new { error = "A jelenlegi jelszó hibás" });
                existedUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
                existedUser.UpdatedAt = DateTime.UtcNow;

                int rowAffected = await _context.SaveChangesAsync();
                if (rowAffected == 0)
                    return BadRequest(new { error = "Nem történt változás." });
                return Ok(new { message = "A jelszó módosítás megtörtént." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }




        [HttpGet("page-to-page")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetUsersPageByPage(
        [FromQuery(Name = "page")] int pageNumb = 1,
        [FromQuery(Name = "count")] int amountperside = 10,
        string orderBy = "id",
        string orderDir = "asc",
        string search = "")
        {
            try
            {
                if (amountperside <= 0)
                {
                    return BadRequest("Az oldalméret nem lehet 0 vagy negatív.");
                }

                if (pageNumb <= 0)
                {
                    pageNumb = 1;
                }

                IQueryable<User> query = _context.Users
                    .Include(x => x.Assignments);

                if (!string.IsNullOrWhiteSpace(search))
                {
                    string searchLower = search.Trim().ToLower();

                    query = query.Where(x =>
                        x.Username.ToLower().Contains(searchLower) ||
                        x.Email.ToLower().Contains(searchLower) ||
                        x.FirstName.ToLower().Contains(searchLower) ||
                        x.LastName.ToLower().Contains(searchLower) ||
                        x.Role.ToLower().Contains(searchLower));
                }

                bool asc = orderDir.ToLower() == "asc";

                query = orderBy.ToLower() switch
                {
                    "id" => asc ? query.OrderBy(x => x.Id) : query.OrderByDescending(x => x.Id),
                    "username" => asc ? query.OrderBy(x => x.Username) : query.OrderByDescending(x => x.Username),
                    "email" => asc ? query.OrderBy(x => x.Email) : query.OrderByDescending(x => x.Email),
                    "firstname" => asc ? query.OrderBy(x => x.FirstName) : query.OrderByDescending(x => x.FirstName),
                    "lastname" => asc ? query.OrderBy(x => x.LastName) : query.OrderByDescending(x => x.LastName),
                    "role" => asc ? query.OrderBy(x => x.Role) : query.OrderByDescending(x => x.Role),
                    "createdat" => asc ? query.OrderBy(x => x.CreatedAt) : query.OrderByDescending(x => x.CreatedAt),
                    "updatedat" => asc ? query.OrderBy(x => x.UpdatedAt) : query.OrderByDescending(x => x.UpdatedAt),
                    _ => asc ? query.OrderBy(x => x.Id) : query.OrderByDescending(x => x.Id)
                };

                int totalUsers = await query.CountAsync();

                var actualUsers = await query
                    .Skip((pageNumb - 1) * amountperside)
                    .Take(amountperside)
                    .Select(x => new
                    {
                        x.Id,
                        x.Username,
                        x.Email,
                        x.FirstName,
                        x.LastName,
                        x.Role,
                        x.CreatedAt,
                        x.UpdatedAt,
                        Assignment = x.Assignments
                    })
                    .ToListAsync();

                double totalPage = Math.Ceiling(totalUsers / (double)amountperside);
                int usersLeft = totalUsers - (amountperside * pageNumb);

                if (usersLeft < 0)
                {
                    usersLeft = 0;
                }

                var dataBack = new
                {
                    totalPage,
                    allAmountOfUsers = totalUsers,
                    totalUsers,
                    usersLeft,
                    actualUsers
                };

                return Ok(dataBack);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteUser(ulong id)
        {

            try
            {

                User? user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);
                if (user == null)
                {
                    return NotFound($"A(z) {id} id vel nem található felhasználó.");
                }
                List<Assignment>? assignment = await _context.Assignments.ToListAsync();
                foreach (var item in assignment)
                {
                    if (item.UserId == id && item.ReturnedAt == null)
                    {
                        return BadRequest("A(z) felhasználó nem törölhető mert eszköz van a nevére kiadva");
                    }

                }    _context.Users.Remove(user);
                int affectedrow = await _context.SaveChangesAsync();
                if (affectedrow == 0)
                {
                    StatusCode(200, "Hiba a müvelet során a rekord nem került törlésre");
                }
                return Ok($"A(z) {id} id-vel a felhasználó törlésre került.");

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }


        }

        [Authorize(Roles = "admin")]
        [HttpGet("search-user")]
        public async Task<IActionResult> SearchUser(string search)
        {
            int limit = 5;

            try
            {
                var query = _context.Users.AsQueryable();
                if (!String.IsNullOrWhiteSpace(search))
                {
                    string searchLower = search.Trim().ToLower();

                    query = query.Where(x => 
                    x.FirstName.ToLower().Contains(searchLower) ||
                    x.LastName.ToLower().Contains(searchLower))
                        .OrderBy(x => x.LastName);
                }
                var users = await query.Take(limit).Select(x => new
                {
                    value = x.Id,
                    label = x.LastName + " " + x.FirstName,
                    firstname = x.FirstName,
                    lastname = x.LastName
                }).ToListAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
