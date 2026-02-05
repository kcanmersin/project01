using CineSocial.Application.Common;
using CineSocial.Domain.Entities.Movie;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Genres.Queries.GetGenres;

public class GetGenresQueryHandler : IRequestHandler<GetGenresQuery, Result<List<GenreDto>>>
{
    private readonly DbContext _context;

    public GetGenresQueryHandler(DbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<GenreDto>>> Handle(GetGenresQuery request, CancellationToken cancellationToken)
    {
        var genres = await _context.Set<Genre>()
            .AsNoTracking()
            .OrderBy(g => g.Name)
            .Select(g => new GenreDto(g.Id, g.TmdbId, g.Name))
            .ToListAsync(cancellationToken);

        return Result<List<GenreDto>>.Success(genres);
    }
}
