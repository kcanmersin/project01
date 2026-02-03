using CineSocial.Domain.Common;
using CineSocial.Domain.Entities.Movie;

namespace CineSocial.Domain.Entities.Social;

public class MovieListItem : BaseEntity
{
    public Guid MovieListId { get; set; }
    public Guid MovieId { get; set; }

    /// <summary>
    /// Order of the movie in the list
    /// </summary>
    public int Order { get; set; }

    /// <summary>
    /// Optional note about why this movie is in the list (max 500 chars)
    /// </summary>
    public string? Note { get; set; }

    // Navigation properties
    public MovieList MovieList { get; set; } = null!;
    public MovieEntity Movie { get; set; } = null!;
}
