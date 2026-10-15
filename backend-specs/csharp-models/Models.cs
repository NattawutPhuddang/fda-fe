using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ThaiFDA.DigitalLabeling.Core.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
        public Guid UserId { get; set; } = Guid.NewGuid();

        [Required, MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? PhoneNumber { get; set; }

        [Required, MaxLength(50)]
        public string Role { get; set; } = string.Empty; // entrepreneur, officer, admin, auditor

        [MaxLength(200)]
        public string? Department { get; set; }

        [MaxLength(255)]
        public string? Organization { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTimeOffset? LastLoginAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public bool IsDeleted { get; set; } = false;

        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }

    [Table("Products")]
    public class Product
    {
        [Key]
        public Guid ProductId { get; set; } = Guid.NewGuid();

        [Required, MaxLength(50)]
        public string Newcode { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string RegNumber { get; set; } = string.Empty;

        [Required, MaxLength(300)]
        public string ProductNameTh { get; set; } = string.Empty;

        [MaxLength(300)]
        public string? ProductNameEn { get; set; }

        [Required, MaxLength(50)]
        public string CategoryId { get; set; } = string.Empty;

        public Guid EntrepreneurId { get; set; }

        [Required, MaxLength(300)]
        public string ManufacturerName { get; set; } = string.Empty;

        [Required, MaxLength(500)]
        public string ManufacturerAddress { get; set; } = string.Empty;

        public DateTime ApprovedDate { get; set; }
        public DateTime ExpiryDate { get; set; }

        [Required, MaxLength(50)]
        public string RegistrationStatus { get; set; } = "ACTIVE";

        public DateTimeOffset LastSyncedAt { get; set; } = DateTimeOffset.UtcNow;

        [Required, MaxLength(100)]
        public string ESubmissionRef { get; set; } = string.Empty;

        public bool IsDeleted { get; set; } = false;

        public virtual ICollection<DigitalLabel> DigitalLabels { get; set; } = new List<DigitalLabel>();
    }

    [Table("DigitalLabels")]
    public class DigitalLabel
    {
        [Key]
        public Guid LabelId { get; set; } = Guid.NewGuid();

        public Guid ProductId { get; set; }
        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; } = null!;

        public int CurrentVersion { get; set; } = 1;

        [Required, MaxLength(50)]
        public string Status { get; set; } = "draft"; // draft, pending_review, in_review, revision_required, approved, published, suspended, rejected

        [Required, MaxLength(300)]
        public string TitleTh { get; set; } = string.Empty;

        [MaxLength(300)]
        public string? TitleEn { get; set; }

        public string? DescriptionTh { get; set; }
        public string? DescriptionEn { get; set; }
        public string? ImageUrl { get; set; }
        public string? GeneralWarningTh { get; set; }
        public string? StorageWarningTh { get; set; }

        public long ScanCount { get; set; } = 0;
        public string? SuspendedReason { get; set; }
        public string? RevisionNotes { get; set; }

        public Guid? CurrentOfficerId { get; set; }
        public DateTimeOffset? SubmittedAt { get; set; }
        public DateTimeOffset? ApprovedAt { get; set; }
        public DateTimeOffset? PublishedAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public bool IsDeleted { get; set; } = false;

        public virtual ICollection<DigitalLabelDocument> Documents { get; set; } = new List<DigitalLabelDocument>();
    }

    [Table("DigitalLabelDocuments")]
    public class DigitalLabelDocument
    {
        [Key]
        public Guid DocumentId { get; set; } = Guid.NewGuid();

        public Guid LabelId { get; set; }
        [ForeignKey("LabelId")]
        public virtual DigitalLabel Label { get; set; } = null!;

        [Required, MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required, MaxLength(500)]
        public string FileUrl { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string ContentType { get; set; } = "application/pdf";

        [Required, MaxLength(50)]
        public string FileSize { get; set; } = string.Empty;

        public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;
    }

    [Table("AuditLogs")]
    public class AuditLog
    {
        [Key]
        public long AuditLogId { get; set; }

        [Required, MaxLength(100)]
        public string EventId { get; set; } = string.Empty;

        public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
        public Guid? UserId { get; set; }

        [Required, MaxLength(200)]
        public string UserName { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string UserRole { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Action { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string ResourceType { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string ResourceId { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Result { get; set; } = "SUCCESS";

        [Required, MaxLength(50)]
        public string IpAddress { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string CorrelationId { get; set; } = string.Empty;

        public string? Details { get; set; }
    }

    public class ThaiFdaDbContext : DbContext
    {
        public ThaiFdaDbContext(DbContextOptions<ThaiFdaDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<DigitalLabel> DigitalLabels => Set<DigitalLabel>();
        public DbSet<DigitalLabelDocument> DigitalLabelDocuments => Set<DigitalLabelDocument>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Product>().HasIndex(p => p.Newcode).IsUnique();
            modelBuilder.Entity<Product>().HasIndex(p => p.RegNumber).IsUnique();
            modelBuilder.Entity<AuditLog>().HasIndex(a => a.CorrelationId);
        }
    }
}
