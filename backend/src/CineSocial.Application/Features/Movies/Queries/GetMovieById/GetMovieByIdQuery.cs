using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.Movies.Queries.GetMovieById;

public record GetMovieByIdQuery(Guid Id) : IRequest<Result<MovieDto>>;
