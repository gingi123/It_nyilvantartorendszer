using System;
using System.Collections.Generic;

namespace Vizsgaremek_backend_ASP.Models;

public partial class Assignment
{
    public ulong Id { get; set; }

    public ulong UserId { get; set; }

    public ulong DeviceId { get; set; }

    public DateTime AssignedAt { get; set; }

    public DateTime? ReturnedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Device Device { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
