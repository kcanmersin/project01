using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CineSocial.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMovieLists : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MovieLists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CoverImageId = table.Column<Guid>(type: "uuid", nullable: true),
                    ListType = table.Column<string>(type: "text", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    MovieCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovieLists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MovieListItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MovieListId = table.Column<Guid>(type: "uuid", nullable: false),
                    MovieId = table.Column<Guid>(type: "uuid", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    Note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovieListItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovieListItems_MovieLists_MovieListId",
                        column: x => x.MovieListId,
                        principalTable: "MovieLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovieListItems_Movies_MovieId",
                        column: x => x.MovieId,
                        principalTable: "Movies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovieListItems_MovieId",
                table: "MovieListItems",
                column: "MovieId");

            migrationBuilder.CreateIndex(
                name: "IX_MovieListItems_MovieListId_MovieId",
                table: "MovieListItems",
                columns: new[] { "MovieListId", "MovieId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MovieListItems_MovieListId_Order",
                table: "MovieListItems",
                columns: new[] { "MovieListId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_MovieLists_UserId",
                table: "MovieLists",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_MovieLists_UserId_ListType",
                table: "MovieLists",
                columns: new[] { "UserId", "ListType" },
                unique: true,
                filter: "\"ListType\" IN ('Watchlist', 'Favorites')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MovieListItems");

            migrationBuilder.DropTable(
                name: "MovieLists");
        }
    }
}
