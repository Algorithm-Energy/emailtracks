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

            modelBuilder.Entity<Company>()
                .HasIndex(c => new { c.CompanyName, c.UserId })
                .IsUnique(false);
        }
    }
}