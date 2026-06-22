using System;
using System.Collections.Generic;

namespace Vizsgaremek_backend_ASP.Models;

public partial class User
{
    public ulong Id { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string Role { get; set; } = null!;

    public string? RememberToken { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}
