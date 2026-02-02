using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CineSocial.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMovieRatings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MovieRatings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    MovieId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rating = table.Column<decimal>(type: "numeric(3,1)", precision: 3, scale: 1, nullable: false),
                    Review = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovieRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovieRatings_Movies_MovieId",
                        column: x => x.MovieId,
                        principalTable: "Movies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovieRatings_MovieId",
                table: "MovieRatings",
                column: "MovieId");

            migrationBuilder.CreateIndex(
                name: "IX_MovieRatings_UserId_MovieId",
                table: "MovieRatings",
                columns: new[] { "UserId", "MovieId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MovieRatings");
        }
    }
}
