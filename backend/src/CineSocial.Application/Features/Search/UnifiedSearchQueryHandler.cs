using CineSocial.Application.Common;
using CineSocial.Domain.Entities.Movie;
using CineSocial.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Search;

public class UnifiedSearchQueryHandler : IRequestHandler<UnifiedSearchQuery, Result<UnifiedSearchResult>>
{
    private readonly DbContext _context;

    public UnifiedSearchQueryHandler(DbContext context)
    {
        _context = context;
    }

    public async Task<Result<UnifiedSearchResult>> Handle(UnifiedSearchQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Query) || request.Query.Length < 2)
        {
            return Result<UnifiedSearchResult>.Success(new UnifiedSearchResult());
        }

        var searchTerm = request.Query.ToLower().Trim();
        var limit = Math.Min(request.Limit, 20); // Max 20 results per type
        var result = new UnifiedSearchResult();

        // Search Movies
        if (request.Type == null || request.Type == SearchType.Movies)
        {
            result.Movies = await SearchMovies(searchTerm, limit, cancellationToken);
        }

        // Search People
        if (request.Type == null || request.Type == SearchType.People)
        {
            result.People = await SearchPeople(searchTerm, limit, cancellationToken);
        }

        // Search Users
        if (request.Type == null || request.Type == SearchType.Users)
        {
            result.Users = await SearchUsers(searchTerm, limit, cancellationToken);
        }

        return Result<UnifiedSearchResult>.Success(result);
    }

    private async Task<List<MovieSearchResult>> SearchMovies(string searchTerm, int limit, CancellationToken cancellationToken)
    {
        return await _context.Set<MovieEntity>()
            .AsNoTracking()
            .Where(m => !m.IsDeleted)
            .Where(m =>
                m.Title.ToLower().Contains(searchTerm) ||
                (m.OriginalTitle != null && m.OriginalTitle.ToLower().Contains(searchTerm)))
            .OrderByDescending(m => m.Popularity)
            .Take(limit)
            .Select(m => new MovieSearchResult(
                m.Id,
                m.TmdbId,
                m.Title,
                m.PosterPath,
                m.ReleaseDate.HasValue ? m.ReleaseDate.Value.Year : null,
                m.VoteAverage
            ))
            .ToListAsync(cancellationToken);
    }

    private async Task<List<PersonSearchResult>> SearchPeople(string searchTerm, int limit, CancellationToken cancellationToken)
    {
        return await _context.Set<Person>()
            .AsNoTracking()
            .Where(p => p.Name.ToLower().Contains(searchTerm))
            .OrderByDescending(p => p.Popularity)
            .Take(limit)
            .Select(p => new PersonSearchResult(
                p.Id,
                p.TmdbId,
                p.Name,
                p.ProfilePath,
                p.KnownForDepartment
            ))
            .ToListAsync(cancellationToken);
    }

    private async Task<List<UserSearchResult>> SearchUsers(string searchTerm, int limit, CancellationToken cancellationToken)
    {
        return await _context.Set<User>()
            .AsNoTracking()
            .Where(u => !u.IsDeleted)
            .Where(u => u.Username.ToLower().Contains(searchTerm))
            .OrderBy(u => u.Username)
            .Take(limit)
            .Select(u => new UserSearchResult(
                u.Id,
                u.Username,
                u.ProfileImageId,
                u.Bio
            ))
            .ToListAsync(cancellationToken);
    }
}
