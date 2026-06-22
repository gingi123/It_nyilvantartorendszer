using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Vizsgaremek_backend_ASP.Models;

namespace Vizsgaremek_backend_ASP.JWT_Token
{
    public class JwtService
    {
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;

        public JwtService(IConfiguration configuration)
        {
            _secretKey = configuration["Jwt:Key"]!;     //key beszerez appsetből
            _issuer = configuration["Jwt:Issuer"]!;
            _audience = configuration["Jwt:Audience"]!;
        }

        public string GenerateToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));       //kulcs beszerez és hozzáad
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);       // generál   Hash265  database be már szintén igy szerepel

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),          //token tartalmaz :  name,  role 
                new Claim(ClaimTypes.Role, user.Role)               //
            };

            var token = new JwtSecurityToken(       ///valós token generálás uj példányba adatokka lejarat idővel 
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);     
        }
    }
}