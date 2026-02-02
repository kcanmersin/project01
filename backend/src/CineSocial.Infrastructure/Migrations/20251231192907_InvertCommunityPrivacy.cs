using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CineSocial.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InvertCommunityPrivacy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE \"Communities\" SET \"IsPrivate\" = NOT \"IsPrivate\";");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
