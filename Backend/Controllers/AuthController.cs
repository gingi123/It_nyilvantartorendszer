using BCrypt.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vizsgaremek_backend_ASP.Database;
using Vizsgaremek_backend_ASP.JWT_Token;
using Vizsgaremek_backend_ASP.Models;


namespace Vizsgaremek_backend_ASP.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ItInventoryContext _context;
        private readonly JwtService _jwtService;

        public AuthController(ItInventoryContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] JWT_Token.LoginRequest request)
        {

            User? user = await _context.Users.FirstOrDefaultAsync(user => user.Username == request.Username);
            if (user == null)
            {
                return Unauthorized($"Helytelen felhasználónév vagy jelszó");    // Biztonági okból ez az üzenet
            }
            //if (user == null || user.PasswordHash != request.Password) // egyszerű hash nélkül
            //    return Unauthorized();
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))    /// jelszó ellenörzése
            {
                return Unauthorized("Helytelen felhasználónév vagy jelszó");   // Biztonági okból ez az üzenet
            }
            var token = _jwtService.GenerateToken(user);                       /// token gencsi

            user.RememberToken = token;                                  // token mentése usertáblába
            int rowaffcted = await _context.SaveChangesAsync();
            if (rowaffcted == 0)
            {
                return StatusCode(500,"Token nem került mentésre");  // ez a státusz kód lehet h nem jó jav* később?? 
            }

            return Ok(new { token });
        }
    }
}
