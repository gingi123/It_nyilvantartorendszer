using System;
using System.Collections.Generic;

namespace Vizsgaremek_backend_ASP.Models;

public partial class DeviceType
{
    public ulong Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Device> Devices { get; set; } = new List<Device>();
}
