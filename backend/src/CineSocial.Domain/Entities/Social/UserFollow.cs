using CineSocial.Domain.Common;

namespace CineSocial.Domain.Entities.Social;

public class UserFollow : BaseEntity
{
    public Guid FollowerId { get; set; }
    public Guid FollowingId { get; set; }

    // Navigation properties
    public User.User Follower { get; set; } = null!;
    public User.User Following { get; set; } = null!;
}
