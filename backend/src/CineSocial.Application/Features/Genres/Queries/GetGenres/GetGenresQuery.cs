using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Genres.Queries.GetGenres;

public class GetGenresQuery : IRequest<Result<List<GenreDto>>>
{
}
