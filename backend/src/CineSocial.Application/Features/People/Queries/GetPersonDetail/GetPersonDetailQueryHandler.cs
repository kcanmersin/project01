using CineSocial.Application.Common;
using CineSocial.Domain.Entities.Movie;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.People.Queries.GetPersonDetail;

public class GetPersonDetailQueryHandler : IRequestHandler<GetPersonDetailQuery, Result<PersonDetailDto>>
{
    private readonly DbContext _context;

    public GetPersonDetailQueryHandler(DbContext context)
    {
        _context = context;
    }

    public async Task<Result<PersonDetailDto>> Handle(GetPersonDetailQuery request, CancellationToken cancellationToken)
    {
        var person = await _context.Set<Person>()
            .AsNoTracking()
            .Where(p => p.Id == request.Id && !p.IsDeleted)
            .Select(p => new
            {
                p.Id,
                p.TmdbId,
                p.Name,
                p.Biography,
                p.Birthday,
                p.Deathday,
                p.PlaceOfBirth,
                p.ProfilePath,
                p.Popularity,
                p.Gender,
                p.KnownForDepartment,
                p.ImdbId,
                MoviesAsCast = p.MovieCasts
                    .Where(mc => !mc.Movie.IsDeleted)
                    .OrderByDescending(mc => mc.Movie.ReleaseDate)
                    .Select(mc => new PersonMovieDto(
                        mc.MovieId,
                        mc.Movie.TmdbId,
                        mc.Movie.Title,
                        mc.Movie.PosterPath,
                        mc.Movie.ReleaseDate,
                        mc.Movie.VoteAverage,
                        mc.Character,
                        mc.CastOrder
                    )).ToList(),
                MoviesAsCrew = p.MovieCrews
                    .Where(mc => !mc.Movie.IsDeleted)
                    .OrderByDescending(mc => mc.Movie.ReleaseDate)
                    .Select(mc => new PersonCrewMovieDto(
                        mc.MovieId,
                        mc.Movie.TmdbId,
                        mc.Movie.Title,
                        mc.Movie.PosterPath,
                        mc.Movie.ReleaseDate,
                        mc.Movie.VoteAverage,
                        mc.Job,
                        mc.Department
                    )).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (person is null)
        {
            return Result<PersonDetailDto>.NotFound($"Person with ID '{request.Id}' was not found.");
        }

        // Calculate age
        int age = 0;
        if (person.Birthday.HasValue)
        {
            var endDate = person.Deathday ?? DateTime.Today;
            age = endDate.Year - person.Birthday.Value.Year;
            if (endDate < person.Birthday.Value.AddYears(age))
                age--;
        }

        var dto = new PersonDetailDto(
            person.Id,
            person.TmdbId,
            person.Name,
            person.Biography,
            person.Birthday,
            person.Deathday,
            person.PlaceOfBirth,
            person.ProfilePath,
            person.Popularity,
            person.Gender,
            person.KnownForDepartment,
            person.ImdbId,
            age,
            person.MoviesAsCast,
            person.MoviesAsCrew
        );

        return Result<PersonDetailDto>.Success(dto);
    }
}
