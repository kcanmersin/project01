using CineSocial.Application.Common;
using CineSocial.Domain.Entities.Movie;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Movies.Queries.GetMovieById;

public class GetMovieByIdQueryHandler : IRequestHandler<GetMovieByIdQuery, Result<MovieDto>>
{
    private readonly DbContext _context;

    public GetMovieByIdQueryHandler(DbContext context)
    {
        _context = context;
    }

    public async Task<Result<MovieDto>> Handle(GetMovieByIdQuery request, CancellationToken cancellationToken)
    {
        var movie = await _context.Set<MovieEntity>()
            .AsNoTracking()
            .Where(m => m.Id == request.Id && !m.IsDeleted)
            .Select(m => new MovieDto(
                m.Id,
                m.TmdbId,
                m.Title,
                m.OriginalTitle,
                m.Overview,
                m.ReleaseDate,
                m.Runtime,
                m.PosterPath,
                m.BackdropPath,
                m.VoteAverage,
                m.VoteCount,
                m.Popularity,
                m.Status,
                m.Tagline
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (movie is null)
        {
            return Result<MovieDto>.NotFound($"Movie with ID '{request.Id}' was not found.");
        }

        return Result<MovieDto>.Success(movie);
    }
}
