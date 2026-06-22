using System;
using System.Collections.Generic;

namespace Vizsgaremek_backend_ASP.Models;

public partial class Device
{
    public ulong Id { get; set; }

    public ulong DeviceTypeId { get; set; }

    public string Manufacturer { get; set; } = null!;

    public string Model { get; set; } = null!;

    public string SerialNumber { get; set; } = null!;

    public string InventoryNumber { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();

    public virtual ICollection<DeviceFile> DeviceFiles { get; set; } = new List<DeviceFile>();

    public virtual DeviceType DeviceType { get; set; } = null!;
}
