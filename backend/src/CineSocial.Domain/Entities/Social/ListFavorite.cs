using CineSocial.Domain.Common;

namespace CineSocial.Domain.Entities.Social;

/// <summary>
/// Represents a user favoriting another user's list
/// </summary>
public class ListFavorite : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid MovieListId { get; set; }

    // Navigation properties
    public User.User User { get; set; } = null!;
    public MovieList MovieList { get; set; } = null!;
}
