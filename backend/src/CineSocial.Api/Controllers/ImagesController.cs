using CineSocial.Application.Features.Images;
using CineSocial.Application.Features.Images.Commands.DeleteCoverImage;
using CineSocial.Application.Features.Images.Commands.DeleteProfileImage;
using CineSocial.Application.Features.Images.Commands.UploadCoverImage;
using CineSocial.Application.Features.Images.Commands.UploadProfileImage;
using CineSocial.Application.Features.Images.Queries.GetImageById;
using CineSocial.Application.Features.Images.Queries.GetUserCoverImage;
using CineSocial.Application.Features.Images.Queries.GetUserProfileImage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Controllers;

[Authorize]
public class ImagesController : BaseApiController
{
    /// <summary>
    /// Upload profile image for current user
    /// </summary>
    [HttpPost("profile")]
    [ProducesResponseType(typeof(ImageUploadResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadProfileImage(IFormFile? file)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        byte[] fileData = Array.Empty<byte>();
        if (file is { Length: > 0 })
        {
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            fileData = stream.ToArray();
        }

        var result = await Mediator.Send(new UploadProfileImageCommand(
            userId.Value, file?.FileName ?? "", file?.ContentType ?? "", fileData));
        return HandleResult(result);
    }

    /// <summary>
    /// Upload cover image for current user
    /// </summary>
    [HttpPost("cover")]
    [ProducesResponseType(typeof(ImageUploadResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadCoverImage(IFormFile? file)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        byte[] fileData = Array.Empty<byte>();
        if (file is { Length: > 0 })
        {
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            fileData = stream.ToArray();
        }

        var result = await Mediator.Send(new UploadCoverImageCommand(
            userId.Value, file?.FileName ?? "", file?.ContentType ?? "", fileData));
        return HandleResult(result);
    }

    /// <summary>
    /// Get image by ID (public endpoint)
    /// </summary>
    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ResponseCache(Duration = 3600)]
    public async Task<IActionResult> GetImage(Guid id)
    {
        var result = await Mediator.Send(new GetImageByIdQuery(id));

        if (!result.IsSuccess)
            return NotFound();

        return File(result.Data!.Data, result.Data.ContentType);
    }

    /// <summary>
    /// Get user's profile image
    /// </summary>
    [AllowAnonymous]
    [HttpGet("user/{userId:guid}/profile")]
    [ResponseCache(Duration = 300)]
    public async Task<IActionResult> GetUserProfileImage(Guid userId)
    {
        var result = await Mediator.Send(new GetUserProfileImageQuery(userId));

        if (!result.IsSuccess)
            return NotFound();

        return File(result.Data!.Data, result.Data.ContentType);
    }

    /// <summary>
    /// Get user's cover image
    /// </summary>
    [AllowAnonymous]
    [HttpGet("user/{userId:guid}/cover")]
    [ResponseCache(Duration = 300)]
    public async Task<IActionResult> GetUserCoverImage(Guid userId)
    {
        var result = await Mediator.Send(new GetUserCoverImageQuery(userId));

        if (!result.IsSuccess)
            return NotFound();

        return File(result.Data!.Data, result.Data.ContentType);
    }

    /// <summary>
    /// Delete current user's profile image
    /// </summary>
    [HttpDelete("profile")]
    public async Task<IActionResult> DeleteProfileImage()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await Mediator.Send(new DeleteProfileImageCommand(userId.Value));
        return HandleResult(result);
    }

    /// <summary>
    /// Delete current user's cover image
    /// </summary>
    [HttpDelete("cover")]
    public async Task<IActionResult> DeleteCoverImage()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await Mediator.Send(new DeleteCoverImageCommand(userId.Value));
        return HandleResult(result);
    }
}
