using CineSocial.Application.Common;
using CineSocial.Domain.Entities.Movie;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Movies.Queries.GetMovieDetail;

public class GetMovieDetailQueryHandler : IRequestHandler<GetMovieDetailQuery, Result<MovieDetailDto>>
{
    private readonly DbContext _context;

    public GetMovieDetailQueryHandler(DbContext context)
    {
        _context = context;
    }

    public async Task<Result<MovieDetailDto>> Handle(GetMovieDetailQuery request, CancellationToken cancellationToken)
    {
        var movie = await _context.Set<MovieEntity>()
            .AsNoTracking()
            .Where(m => m.Id == request.Id && !m.IsDeleted)
            .Select(m => new MovieDetailDto(
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
                m.Tagline,
                m.Homepage,
                m.Budget,
                m.Revenue,
                m.ImdbId,
                m.MovieGenres.Select(mg => new GenreDto(mg.Genre.Id, mg.Genre.Name)).ToList(),
                m.MovieCasts
                    .OrderBy(mc => mc.CastOrder)
                    .Take(20)
                    .Select(mc => new CastMemberDto(
                        mc.PersonId,
                        mc.Person.Name,
                        mc.Character,
                        mc.Person.ProfilePath,
                        mc.CastOrder
                    )).ToList(),
                m.MovieCrews
                    .Where(mc => mc.Department == "Directing" || mc.Department == "Writing" || mc.Department == "Production")
                    .Take(10)
                    .Select(mc => new CrewMemberDto(
                        mc.PersonId,
                        mc.Person.Name,
                        mc.Job,
                        mc.Department,
                        mc.Person.ProfilePath
                    )).ToList()
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (movie is null)
        {
            return Result<MovieDetailDto>.NotFound($"Movie with ID '{request.Id}' was not found.");
        }

        return Result<MovieDetailDto>.Success(movie);
    }
}
