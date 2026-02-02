using CineSocial.Application.Interfaces;
using CineSocial.Domain.Entities.Media;
using CineSocial.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Infrastructure.Services;

/// <summary>
/// Database-based image storage service.
/// Stores images as Base64 in the database.
/// Can be replaced with cloud storage implementation later.
/// </summary>
public class DatabaseImageStorageService : IImageStorageService
{
    private readonly CineSocialDbContext _context;
    private const int MaxFileSizeBytes = 5 * 1024 * 1024; // 5MB limit

    public DatabaseImageStorageService(CineSocialDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> UploadAsync(string bucket, Guid ownerId, string fileName, string contentType, byte[] imageData)
    {
        if (imageData.Length > MaxFileSizeBytes)
        {
            throw new InvalidOperationException($"Image size exceeds maximum allowed size of {MaxFileSizeBytes / 1024 / 1024}MB");
        }

        // Validate content type
        if (!IsValidImageType(contentType))
        {
            throw new InvalidOperationException("Invalid image type. Allowed types: JPEG, PNG, GIF, WebP");
        }

        // Delete existing image for this bucket/owner (only keep latest)
        var existingImages = await _context.Set<StoredImage>()
            .Where(i => i.Bucket == bucket && i.OwnerId == ownerId && !i.IsDeleted)
            .ToListAsync();

        foreach (var existing in existingImages)
        {
            existing.IsDeleted = true;
            existing.DeletedAt = DateTime.UtcNow;
        }

        // Create new image
        var image = new StoredImage
        {
            Id = Guid.NewGuid(),
            Bucket = bucket,
            OwnerId = ownerId,
            FileName = SanitizeFileName(fileName),
            ContentType = contentType,
            Base64Data = Convert.ToBase64String(imageData),
            FileSize = imageData.Length,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        // Try to get image dimensions (basic parsing for common formats)
        var dimensions = TryGetImageDimensions(imageData, contentType);
        if (dimensions.HasValue)
        {
            image.Width = dimensions.Value.width;
            image.Height = dimensions.Value.height;
        }

        _context.Set<StoredImage>().Add(image);
        await _context.SaveChangesAsync();

        return image.Id;
    }

    public async Task<ImageData?> GetByIdAsync(Guid imageId)
    {
        var image = await _context.Set<StoredImage>()
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == imageId && !i.IsDeleted);

        return image == null ? null : ToImageData(image);
    }

    public async Task<ImageData?> GetByBucketAndOwnerAsync(string bucket, Guid ownerId)
    {
        var image = await _context.Set<StoredImage>()
            .AsNoTracking()
            .Where(i => i.Bucket == bucket && i.OwnerId == ownerId && !i.IsDeleted)
            .OrderByDescending(i => i.CreatedAt)
            .FirstOrDefaultAsync();

        return image == null ? null : ToImageData(image);
    }

    public async Task<bool> DeleteAsync(Guid imageId)
    {
        var image = await _context.Set<StoredImage>()
            .FirstOrDefaultAsync(i => i.Id == imageId && !i.IsDeleted);

        if (image == null) return false;

        image.IsDeleted = true;
        image.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<int> DeleteByBucketAndOwnerAsync(string bucket, Guid ownerId)
    {
        var images = await _context.Set<StoredImage>()
            .Where(i => i.Bucket == bucket && i.OwnerId == ownerId && !i.IsDeleted)
            .ToListAsync();

        foreach (var image in images)
        {
            image.IsDeleted = true;
            image.DeletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return images.Count;
    }

    private static ImageData ToImageData(StoredImage image)
    {
        return new ImageData(
            image.Id,
            image.Bucket,
            image.OwnerId,
            image.FileName,
            image.ContentType,
            Convert.FromBase64String(image.Base64Data),
            image.FileSize,
            image.Width,
            image.Height,
            image.CreatedAt
        );
    }

    private static bool IsValidImageType(string contentType)
    {
        return contentType.ToLower() switch
        {
            "image/jpeg" => true,
            "image/jpg" => true,
            "image/png" => true,
            "image/gif" => true,
            "image/webp" => true,
            _ => false
        };
    }

    private static string SanitizeFileName(string fileName)
    {
        // Remove potentially dangerous characters
        var invalid = Path.GetInvalidFileNameChars();
        return string.Join("_", fileName.Split(invalid, StringSplitOptions.RemoveEmptyEntries));
    }

    private static (int width, int height)? TryGetImageDimensions(byte[] data, string contentType)
    {
        try
        {
            // Basic dimension parsing for common formats
            if (contentType.Contains("png") && data.Length > 24)
            {
                // PNG: width at bytes 16-19, height at bytes 20-23 (big endian)
                var width = (data[16] << 24) | (data[17] << 16) | (data[18] << 8) | data[19];
                var height = (data[20] << 24) | (data[21] << 16) | (data[22] << 8) | data[23];
                return (width, height);
            }

            if ((contentType.Contains("jpeg") || contentType.Contains("jpg")) && data.Length > 2)
            {
                // JPEG: Need to parse SOF segments
                return TryParseJpegDimensions(data);
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    private static (int width, int height)? TryParseJpegDimensions(byte[] data)
    {
        int i = 2; // Skip SOI marker
        while (i < data.Length - 9)
        {
            if (data[i] != 0xFF) break;

            var marker = data[i + 1];

            // SOF0, SOF1, SOF2
            if (marker >= 0xC0 && marker <= 0xC2)
            {
                var height = (data[i + 5] << 8) | data[i + 6];
                var width = (data[i + 7] << 8) | data[i + 8];
                return (width, height);
            }

            // Skip to next segment
            var segmentLength = (data[i + 2] << 8) | data[i + 3];
            i += segmentLength + 2;
        }

        return null;
    }
}
