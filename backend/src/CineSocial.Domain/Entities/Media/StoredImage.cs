using CineSocial.Domain.Common;

namespace CineSocial.Domain.Entities.Media;

/// <summary>
/// Generic image storage entity. Stores images as Base64 in database.
/// Can be extended to support different buckets (profile, cover, post, etc.)
/// </summary>
public class StoredImage : BaseEntity
{
    /// <summary>
    /// The bucket/category this image belongs to (e.g., "profile", "cover", "post")
    /// </summary>
    public string Bucket { get; set; } = string.Empty;

    /// <summary>
    /// The ID of the entity this image belongs to (e.g., UserId, PostId)
    /// </summary>
    public Guid OwnerId { get; set; }

    /// <summary>
    /// Original filename uploaded by user
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// MIME type (e.g., image/jpeg, image/png)
    /// </summary>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// Image data stored as Base64 string
    /// </summary>
    public string Base64Data { get; set; } = string.Empty;

    /// <summary>
    /// File size in bytes
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// Optional: Image width in pixels
    /// </summary>
    public int? Width { get; set; }

    /// <summary>
    /// Optional: Image height in pixels
    /// </summary>
    public int? Height { get; set; }
}

/// <summary>
/// Predefined bucket names for image storage
/// </summary>
public static class ImageBuckets
{
    public const string UserProfile = "user_profile";
    public const string UserCover = "user_cover";
    // Add more buckets as needed:
    // public const string PostImage = "post_image";
    // public const string MoviePoster = "movie_poster";
}
