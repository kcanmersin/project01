using CineSocial.Domain.Common;
using CineSocial.Domain.Enums;

namespace CineSocial.Domain.Entities.Social;

public class MovieList : BaseEntity
{
    public Guid UserId { get; set; }

    /// <summary>
    /// List title (max 100 chars)
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Optional description (max 500 chars)
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Optional cover image
    /// </summary>
    public Guid? CoverImageId { get; set; }

    /// <summary>
    /// Type of list: Watchlist, Favorites, or Custom
    /// </summary>
    public ListType ListType { get; set; }

    /// <summary>
    /// Whether the list is publicly visible
    /// </summary>
    public bool IsPublic { get; set; }

    /// <summary>
    /// Denormalized count of movies in the list
    /// </summary>
    public int MovieCount { get; set; }

    // Navigation properties
    public User.User User { get; set; } = null!;
    public ICollection<MovieListItem> Items { get; set; } = new List<MovieListItem>();
    public ICollection<ListFavorite> Favorites { get; set; } = new List<ListFavorite>();
}
