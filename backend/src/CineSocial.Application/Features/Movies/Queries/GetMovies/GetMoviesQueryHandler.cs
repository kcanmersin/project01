using CineSocial.Application.Common;
using CineSocial.Domain.Entities.Movie;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Movies.Queries.GetMovies;

public class GetMoviesQueryHandler : IRequestHandler<GetMoviesQuery, Result<PagedResult<MovieDto>>>
{
    private readonly DbContext _context;

    public GetMoviesQueryHandler(DbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<MovieDto>>> Handle(GetMoviesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Set<MovieEntity>()
            .AsNoTracking()
            .Where(m => !m.IsDeleted);

        // Search filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(m => 
                m.Title.ToLower().Contains(searchTerm) || 
                (m.OriginalTitle != null && m.OriginalTitle.ToLower().Contains(searchTerm)));
        }

        // Year filter (single year - legacy)
        if (request.Year.HasValue)
        {
            query = query.Where(m => m.ReleaseDate.HasValue && m.ReleaseDate.Value.Year == request.Year.Value);
        }

        // Year range filter
        if (request.MinYear.HasValue)
        {
            query = query.Where(m => m.ReleaseDate.HasValue && m.ReleaseDate.Value.Year >= request.MinYear.Value);
        }
        if (request.MaxYear.HasValue)
        {
            query = query.Where(m => m.ReleaseDate.HasValue && m.ReleaseDate.Value.Year <= request.MaxYear.Value);
        }

        // Rating range filter
        if (request.MinRating.HasValue)
        {
            query = query.Where(m => m.VoteAverage.HasValue && m.VoteAverage.Value >= request.MinRating.Value);
        }
        if (request.MaxRating.HasValue)
        {
            query = query.Where(m => m.VoteAverage.HasValue && m.VoteAverage.Value <= request.MaxRating.Value);
        }

        // Runtime range filter
        if (request.MinRuntime.HasValue)
        {
            query = query.Where(m => m.Runtime.HasValue && m.Runtime.Value >= request.MinRuntime.Value);
        }
        if (request.MaxRuntime.HasValue)
        {
            query = query.Where(m => m.Runtime.HasValue && m.Runtime.Value <= request.MaxRuntime.Value);
        }

        // Genre filter
        if (request.GenreIds != null && request.GenreIds.Count > 0)
        {
            query = query.Where(m => m.MovieGenres.Any(mg => request.GenreIds.Contains(mg.GenreId)));
        }

        // Country filter
        if (request.CountryIds != null && request.CountryIds.Count > 0)
        {
            query = query.Where(m => m.MovieCountries.Any(mc => request.CountryIds.Contains(mc.CountryId)));
        }

        // Language filter
        if (request.LanguageIds != null && request.LanguageIds.Count > 0)
        {
            query = query.Where(m => m.MovieLanguages.Any(ml => request.LanguageIds.Contains(ml.LanguageId)));
        }

        // Sorting
        query = request.SortBy?.ToLower() switch
        {
            "releasedate" => request.SortDescending 
                ? query.OrderByDescending(m => m.ReleaseDate) 
                : query.OrderBy(m => m.ReleaseDate),
            "voteaverage" => request.SortDescending 
                ? query.OrderByDescending(m => m.VoteAverage) 
                : query.OrderBy(m => m.VoteAverage),
            "popularity" => request.SortDescending 
                ? query.OrderByDescending(m => m.Popularity) 
                : query.OrderBy(m => m.Popularity),
            _ => request.SortDescending 
                ? query.OrderByDescending(m => m.Title) 
                : query.OrderBy(m => m.Title)
        };

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var movies = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
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
            .ToListAsync(cancellationToken);

        var pagedResult = PagedResult<MovieDto>.Create(movies, totalCount, request.PageNumber, request.PageSize);
        
        return Result<PagedResult<MovieDto>>.Success(pagedResult);
    }
}
