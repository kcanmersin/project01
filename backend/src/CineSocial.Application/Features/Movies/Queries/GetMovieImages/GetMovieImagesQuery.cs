using CineSocial.Application.Common;
using CineSocial.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSocial.Application.Features.Movies.Queries.GetMovieImages;

public record GetMovieImagesQuery(Guid MovieId) : IRequest<Result<MovieImagesDto>>;

public record MovieImageDto(
    Guid Id,
    string FilePath,
    string? ImageType,
    string? Language,
    double? VoteAverage,
    int? VoteCount,
    int? Width,
    int? Height
);

public record MovieImagesDto(
    List<MovieImageDto> Posters,
    List<MovieImageDto> Backdrops,
    List<MovieImageDto> Logos,
    List<MovieImageDto> Other
);

public class GetMovieImagesHandler : IRequestHandler<GetMovieImagesQuery, Result<MovieImagesDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMovieImagesHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<MovieImagesDto>> Handle(GetMovieImagesQuery request, CancellationToken cancellationToken)
    {
        // Check if movie exists
        var movieExists = await _context.Movies
            .AnyAsync(m => m.Id == request.MovieId && !m.IsDeleted, cancellationToken);

        if (!movieExists)
            return Result<MovieImagesDto>.NotFound("Movie not found");

        var images = await _context.MovieImages
            .AsNoTracking()
            .Where(i => i.MovieId == request.MovieId)
            .Select(i => new MovieImageDto(
                i.Id,
                i.FilePath,
                i.ImageType,
                i.Language,
                i.VoteAverage,
                i.VoteCount,
                i.Width,
                i.Height
            ))
            .ToListAsync(cancellationToken);

        // Group images by type
        var posters = images.Where(i => i.ImageType?.ToLower() == "poster").ToList();
        var backdrops = images.Where(i => i.ImageType?.ToLower() == "backdrop").ToList();
        var logos = images.Where(i => i.ImageType?.ToLower() == "logo").ToList();
        var other = images.Where(i =>
            i.ImageType?.ToLower() != "poster" &&
            i.ImageType?.ToLower() != "backdrop" &&
            i.ImageType?.ToLower() != "logo"
        ).ToList();

        return Result<MovieImagesDto>.Success(new MovieImagesDto(posters, backdrops, logos, other));
    }
}
