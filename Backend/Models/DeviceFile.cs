using System;
using System.Collections.Generic;

namespace Vizsgaremek_backend_ASP.Models;

public partial class DeviceFile
{
    public ulong Id { get; set; }

    public ulong DeviceId { get; set; }

    public string FileType { get; set; } = null!;

    public string FilePath { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Device Device { get; set; } = null!;
}
