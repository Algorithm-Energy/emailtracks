using Microsoft.EntityFrameworkCore;
using EmailTrackingAPI.Models;

namespace EmailTrackingAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Prospect> Prospects { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>()
                .HasKey(u => u.Id);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Company configuration
            modelBuilder.Entity<Company>()
                .HasKey(c => c.Id);

            // Username is not a DB column — it's populated via join in the service
            modelBuilder.Entity<Company>()
                .Ignore(c => c.Username);

            modelBuilder.Entity<Company>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Index for performance
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.UserId);

            // Prospect configuration
            modelBuilder.Entity<Prospect>().HasKey(p => p.Id);
            modelBuilder.Entity<Prospect>().Ignore(p => p.AssignedToUsername);
            modelBuilder.Entity<Prospect>().Ignore(p => p.CreatedByUsername);

            modelBuilder.Entity<Prospect>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(p => p.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Prospect>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(p => p.AssignedToUserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Prospect>().HasIndex(p => p.AssignedToUserId);
            modelBuilder.Entity<Prospect>().HasIndex(p => p.Status);

            // ActivityLog configuration
            modelBuilder.Entity<ActivityLog>().ToTable("ActivityLog");
            modelBuilder.Entity<ActivityLog>().HasKey(a => a.Id);
            modelBuilder.Entity<ActivityLog>().Ignore(a => a.Username);
            modelBuilder.Entity<ActivityLog>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<ActivityLog>()
                .HasIndex(a => new { a.EntityType, a.EntityId });

            modelBuilder.Entity<Company>()
                .HasIndex(c => new { c.CompanyName, c.UserId })
                .IsUnique(false);
        }
    }
}