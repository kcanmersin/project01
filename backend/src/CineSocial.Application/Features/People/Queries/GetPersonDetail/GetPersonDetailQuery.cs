using CineSocial.Application.Common;
using MediatR;

namespace CineSocial.Application.Features.People.Queries.GetPersonDetail;

public record GetPersonDetailQuery(Guid Id) : IRequest<Result<PersonDetailDto>>;
