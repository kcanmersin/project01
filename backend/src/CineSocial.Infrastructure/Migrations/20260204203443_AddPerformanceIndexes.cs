using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CineSocial.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_MovieRatings_UserId_IsDeleted_CreatedAt",
                table: "MovieRatings",
                columns: new[] { "UserId", "IsDeleted", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Comments_UserId_IsDeleted_CreatedAt",
                table: "Comments",
                columns: new[] { "UserId", "IsDeleted", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MovieRatings_UserId_IsDeleted_CreatedAt",
                table: "MovieRatings");

            migrationBuilder.DropIndex(
                name: "IX_Comments_UserId_IsDeleted_CreatedAt",
                table: "Comments");
        }
    }
}
