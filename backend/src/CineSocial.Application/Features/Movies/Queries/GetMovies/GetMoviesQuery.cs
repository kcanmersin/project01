using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Movies.Queries.GetMovies;

public class GetMoviesQuery : PaginationQuery, IRequest<Result<PagedResult<MovieDto>>>
{
    public string? SearchTerm { get; set; }
    public int? Year { get; set; }
    public string? SortBy { get; set; } = "Popularity"; // Title, ReleaseDate, VoteAverage, Popularity
    public bool SortDescending { get; set; } = true;
    
    // Advanced filters
    public List<int>? GenreIds { get; set; }
    public List<int>? CountryIds { get; set; }
    public List<int>? LanguageIds { get; set; }
    public double? MinRating { get; set; }
    public double? MaxRating { get; set; }
    public int? MinYear { get; set; }
    public int? MaxYear { get; set; }
    public int? MinRuntime { get; set; }
    public int? MaxRuntime { get; set; }
}
