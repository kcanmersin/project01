using FluentValidation;

namespace CineSocial.Application.Features.Ratings.Commands.AddOrUpdateRating;

public class AddOrUpdateRatingCommandValidator : AbstractValidator<AddOrUpdateRatingCommand>
{
    public AddOrUpdateRatingCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.MovieId)
            .NotEmpty().WithMessage("Movie ID is required");

        RuleFor(x => x.Rating)
            .InclusiveBetween(0, 10).WithMessage("Rating must be between 0 and 10");

        RuleFor(x => x.Review)
            .MaximumLength(2000).WithMessage("Review cannot exceed 2000 characters");
    }
}
