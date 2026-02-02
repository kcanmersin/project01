using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CineSocial.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixSocialEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BannerImageId",
                table: "Communities");

            migrationBuilder.DropColumn(
                name: "IconImageId",
                table: "Communities");

            migrationBuilder.RenameColumn(
                name: "FollowingId",
                table: "UserFollows",
                newName: "FollowedId");

            migrationBuilder.RenameIndex(
                name: "IX_UserFollows_FollowingId",
                table: "UserFollows",
                newName: "IX_UserFollows_FollowedId");

            migrationBuilder.RenameIndex(
                name: "IX_UserFollows_FollowerId_FollowingId",
                table: "UserFollows",
                newName: "IX_UserFollows_FollowerId_FollowedId");

            migrationBuilder.RenameColumn(
                name: "IsPublic",
                table: "Communities",
                newName: "IsPrivate");

            migrationBuilder.AddColumn<DateTime>(
                name: "JoinedAt",
                table: "CommunityMembers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "BannerUrl",
                table: "Communities",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatorId",
                table: "Communities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "IconUrl",
                table: "Communities",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_UserFollows_Users_FollowedId",
                table: "UserFollows",
                column: "FollowedId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserFollows_Users_FollowerId",
                table: "UserFollows",
                column: "FollowerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserFollows_Users_FollowedId",
                table: "UserFollows");

            migrationBuilder.DropForeignKey(
                name: "FK_UserFollows_Users_FollowerId",
                table: "UserFollows");

            migrationBuilder.DropColumn(
                name: "JoinedAt",
                table: "CommunityMembers");

            migrationBuilder.DropColumn(
                name: "BannerUrl",
                table: "Communities");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "Communities");

            migrationBuilder.DropColumn(
                name: "IconUrl",
                table: "Communities");

            migrationBuilder.RenameColumn(
                name: "FollowedId",
                table: "UserFollows",
                newName: "FollowingId");

            migrationBuilder.RenameIndex(
                name: "IX_UserFollows_FollowerId_FollowedId",
                table: "UserFollows",
                newName: "IX_UserFollows_FollowerId_FollowingId");

            migrationBuilder.RenameIndex(
                name: "IX_UserFollows_FollowedId",
                table: "UserFollows",
                newName: "IX_UserFollows_FollowingId");

            migrationBuilder.RenameColumn(
                name: "IsPrivate",
                table: "Communities",
                newName: "IsPublic");

            migrationBuilder.AddColumn<string>(
                name: "BannerImageId",
                table: "Communities",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IconImageId",
                table: "Communities",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }
    }
}
