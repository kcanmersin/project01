namespace CineSocial.Application.Interfaces;

/// <summary>
/// Generic image storage service interface.
/// Currently stores in database, can be extended to support cloud storage.
/// </summary>
public interface IImageStorageService
{
    /// <summary>
    /// Upload an image to a specific bucket
    /// </summary>
    /// <param name="bucket">Bucket name (e.g., "user_profile", "user_cover")</param>
    /// <param name="ownerId">ID of the entity that owns this image</param>
    /// <param name="fileName">Original filename</param>
    /// <param name="contentType">MIME type</param>
    /// <param name="imageData">Raw image bytes</param>
    /// <returns>The stored image ID</returns>
    Task<Guid> UploadAsync(string bucket, Guid ownerId, string fileName, string contentType, byte[] imageData);

    /// <summary>
    /// Get an image by its ID
    /// </summary>
    Task<ImageData?> GetByIdAsync(Guid imageId);

    /// <summary>
    /// Get the latest image for a specific bucket and owner
    /// </summary>
    Task<ImageData?> GetByBucketAndOwnerAsync(string bucket, Guid ownerId);

    /// <summary>
    /// Delete an image by ID
    /// </summary>
    Task<bool> DeleteAsync(Guid imageId);

    /// <summary>
    /// Delete all images for a specific bucket and owner
    /// </summary>
    Task<int> DeleteByBucketAndOwnerAsync(string bucket, Guid ownerId);
}

/// <summary>
/// Image data returned from storage
/// </summary>
public record ImageData(
    Guid Id,
    string Bucket,
    Guid OwnerId,
    string FileName,
    string ContentType,
    byte[] Data,
    long FileSize,
    int? Width,
    int? Height,
    DateTime CreatedAt
);
