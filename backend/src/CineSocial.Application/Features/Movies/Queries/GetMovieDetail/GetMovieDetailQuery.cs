using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Movies.Queries.GetMovieDetail;

public record GetMovieDetailQuery(Guid Id) : IRequest<Result<MovieDetailDto>>;
