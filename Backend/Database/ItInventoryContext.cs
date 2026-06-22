using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Vizsgaremek_backend_ASP.Models;

namespace Vizsgaremek_backend_ASP.Database;

public partial class ItInventoryContext : DbContext
{
    public ItInventoryContext()
    {
    }

    public ItInventoryContext(DbContextOptions<ItInventoryContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Assignment> Assignments { get; set; }

    public virtual DbSet<Device> Devices { get; set; }

    public virtual DbSet<DeviceFile> DeviceFiles { get; set; }

    public virtual DbSet<DeviceType> DeviceTypes { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySQL("Server=localhost;Database=it_inventory;Uid=root;Pwd=");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("assignments");

            entity.HasIndex(e => e.UserId, "FK_assignments_user_id");

            entity.HasIndex(e => new { e.DeviceId, e.ReturnedAt }, "uk_assignments_active_device").IsUnique();

            entity.Property(e => e.Id)
                .HasColumnType("bigint(20) unsigned")
                .HasColumnName("id");
            entity.Property(e => e.AssignedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("timestamp")
                .HasColumnName("assigned_at");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.DeviceId)
                .HasColumnType("bigint(20) unsigned")
                .HasColumnName("device_id");
            entity.Property(e => e.ReturnedAt)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("timestamp")
                .HasColumnName("returned_at");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("timestamp")
                .HasColumnName("updated_at");
            entity.Property(e => e.UserId)
                .HasColumnType("bigint(20) unsigned")
                .HasColumnName("user_id");

            entity.HasOne(d => d.Device).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.DeviceId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_assignments_device_id");

            entity.HasOne(d => d.User).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_assignments_user_id");
        });

        modelBuilder.Entity<Device>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("devices");

            entity.HasIndex(e => e.DeviceTypeId, "FK_devices_device_type_id");

            entity.HasIndex(e => e.InventoryNumber, "inventory_number").IsUnique();

            entity.HasIndex(e => e.SerialNumber, "serial_number").IsUnique();

            entity.Property(e => e.Id)
                .HasColumnType("bigint(20) unsigned")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.DeviceTypeId)
                .HasColumnType("bigint(20) unsigned")
                .HasColumnName("device_type_id");
            entity.Property(e => e.InventoryNumber).HasColumnName("inventory_number");
            entity.Property(e => e.Manufacturer)
                .HasMaxLength(100)
                .HasColumnName("manufacturer");
            entity.Property(e => e.Model)
                .HasMaxLength(255)
                .HasColumnName("model");
            entity.Property(e => e.SerialNumber).HasColumnName("serial_number");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'''available'''")
                .HasColumnType("enum('available','assigned','unavailable')")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("timestamp")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.DeviceType).WithMany(p => p.Devices)
                .HasForeignKey(d => d.DeviceTypeId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_devices_device_type_id");
        });

        modelBuilder.Entity<DeviceFile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("device_files");

            entity.HasIndex(e => new { e.DeviceId, e.FileType }, "uk_device_files_one_per_type").IsUnique();

            entity.Property(e => e.Id)
                .HasColumnType("bigint(20) unsigned")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.DeviceId)
                .HasColumnType("bigint(20) unsigned")
                .HasColumnName("device_id");
            entity.Property(e => e.FilePath)
                .HasMaxLength(256)
                .HasColumnName("file_path");
            entity.Property(e => e.FileType)
                .HasColumnType("enum('invoice','user_guide','warranty','other')")
                .HasColumnName("file_type");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("timestamp")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Device).WithMany(p => p.DeviceFiles)
                .HasForeignKey(d => d.DeviceId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_device_files_device_id");
        });

        modelBuilder.Entity<DeviceType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("device_types");

            entity.HasIndex(e => e.Name, "name").IsUnique();

            entity.Property(e => e.Id)
                .HasColumnType("bigint(20) unsigned")
                .HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "email").IsUnique();

            entity.HasIndex(e => e.Username, "username").IsUnique();

            entity.Property(e => e.Id)
                .HasColumnType("bigint(20) unsigned")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("first_name");
            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("last_name");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .HasColumnName("password_hash");
            entity.Property(e => e.RememberToken)
                .HasMaxLength(100)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("remember_token");
            entity.Property(e => e.Role)
                .HasDefaultValueSql("'''user'''")
                .HasColumnType("enum('admin','user')")
                .HasColumnName("role");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'current_timestamp()'")
                .HasColumnType("timestamp")
                .HasColumnName("updated_at");
            entity.Property(e => e.Username).HasColumnName("username");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
