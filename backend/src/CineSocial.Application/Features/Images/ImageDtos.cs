namespace CineSocial.Application.Features.Images;

public record ImageUploadResultDto(Guid ImageId, string Url);
public record DeleteImageResultDto(bool Deleted);
public record ImageDataDto(byte[] Data, string ContentType);
