using FluentValidation;

namespace CineSocial.Application.Features.Auth.Queries.Login;

public class LoginQueryValidator : AbstractValidator<LoginQuery>
{
    public LoginQueryValidator()
    {
        RuleFor(x => x.EmailOrUsername)
            .NotEmpty().WithMessage("Email or username is required");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required");
    }
}
