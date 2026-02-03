using CineSocial.Application.Features.Ratings;
using CineSocial.Application.Features.Ratings.Commands.AddOrUpdateRating;
using CineSocial.Application.Features.Ratings.Commands.DeleteRating;
using CineSocial.Application.Features.Ratings.Queries.GetMovieRatings;
using CineSocial.Application.Features.Ratings.Queries.GetMovieRatingStats;
using CineSocial.Application.Features.Ratings.Queries.GetMyRating;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSocial.Api.Controllers;

public class RatingsController : BaseApiController
{
    /// <summary>
    /// Rate a movie (or update existing rating)
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<RatingDto>> RateMovie([FromBody] RateMovieRequest request)
    {
        var userId = GetCurrentUserIdRequired();
        var result = await Mediator.Send(new AddOrUpdateRatingCommand(
            userId,
            request.MovieId,
            request.Rating,
            request.Review
        ));
        return HandleResult(result);
    }

    /// <summary>
    /// Delete your rating for a movie
    /// </summary>
    [HttpDelete("movies/{movieId:guid}")]
    [Authorize]
    public async Task<ActionResult> DeleteRating(Guid movieId)
    {
        var userId = GetCurrentUserIdRequired();
        var result = await Mediator.Send(new DeleteRatingCommand(userId, movieId));
        return HandleResult(result);
    }

    /// <summary>
    /// Get your rating for a movie
    /// </summary>
    [HttpGet("movies/{movieId:guid}/my-rating")]
    [Authorize]
    public async Task<ActionResult<UserRatingDto?>> GetMyRating(Guid movieId)
    {
        var userId = GetCurrentUserIdRequired();
        var result = await Mediator.Send(new GetMyRatingQuery(userId, movieId));
        return HandleResult(result);
    }

    /// <summary>
    /// Get all ratings for a movie
    /// </summary>
    [HttpGet("movies/{movieId:guid}")]
    public async Task<ActionResult<Application.Common.PagedResult<RatingDto>>> GetMovieRatings(
        Guid movieId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetMovieRatingsQuery(movieId, page, pageSize));
        return HandleResult(result);
    }

    /// <summary>
    /// Get rating statistics for a movie
    /// </summary>
    [HttpGet("movies/{movieId:guid}/stats")]
    public async Task<ActionResult<MovieRatingStatsDto>> GetMovieRatingStats(Guid movieId)
    {
        var result = await Mediator.Send(new GetMovieRatingStatsQuery(movieId));
        return HandleResult(result);
    }
}

public record RateMovieRequest(
    Guid MovieId,
    decimal Rating,
    string? Review
);
