using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Vizsgaremek_backend_ASP.Database;
using Vizsgaremek_backend_ASP.JWT_Token;

var builder = WebApplication.CreateBuilder(args);

// DI regisztrációk
builder.Services.AddScoped<JwtService>();

// Controllers
builder.Services.AddControllers();

// CORS beállítás configból
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// DbContext regisztráció MySQL-re
builder.Services.AddDbContext<ItInventoryContext>(options =>
{
    string? connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseMySQL(connectionString!);
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT kulcs
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

// JWT Authentication beállítás
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,          // false - egyszerűsített
        ValidateAudience = true,        // false - egyszerűsített
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],        // nem kell ha false
        ValidAudience = jwtSettings["Audience"],    // nem kell ha felse
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

var app = builder.Build();

// Middlewares sorrend nagyon fontos! (hogy rohadjon meg... )
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("Frontend");

app.UseStaticFiles();

app.UseAuthentication();   // EZ KELL előbb, mint app.UseAuthorization(); 
app.UseAuthorization();

app.MapControllers();

app.Run();