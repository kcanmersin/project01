using CineSocial.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace CineSocial.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailVerificationAsync(string toEmail, string username, string verificationLink, CancellationToken cancellationToken = default)
    {
        var subject = "CineFeel - Email Doğrulama";
        var body = GetVerificationEmailTemplate(username, verificationLink);
        await SendEmailAsync(toEmail, subject, body, cancellationToken);
    }

    public async Task SendPasswordResetAsync(string toEmail, string username, string resetLink, CancellationToken cancellationToken = default)
    {
        var subject = "CineFeel - Şifre Sıfırlama";
        var body = GetPasswordResetEmailTemplate(username, resetLink);
        await SendEmailAsync(toEmail, subject, body, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string username, CancellationToken cancellationToken = default)
    {
        var subject = "CineFeel'e Hoş Geldiniz!";
        var body = GetWelcomeEmailTemplate(username);
        await SendEmailAsync(toEmail, subject, body, cancellationToken);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken)
    {
        var smtpHost = _configuration["SMTP_HOST"];
        var smtpPort = int.Parse(_configuration["SMTP_PORT"] ?? "587");
        var smtpUsername = _configuration["SMTP_USERNAME"];
        var smtpPassword = _configuration["SMTP_PASSWORD"];
        var fromEmail = _configuration["SMTP_FROM_EMAIL"] ?? "noreply@cinefeel.com";
        var fromName = _configuration["SMTP_FROM_NAME"] ?? "CineFeel";

        if (string.IsNullOrWhiteSpace(smtpHost))
        {
            _logger.LogWarning("SMTP is not configured. Email will not be sent to {Email}", toEmail);
            _logger.LogInformation("Email content for {Email}: Subject: {Subject}", toEmail, subject);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(new MailboxAddress(toEmail, toEmail));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = htmlBody
        };

        message.Body = bodyBuilder.ToMessageBody();

        try
        {
            using var client = new SmtpClient();

            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls, cancellationToken);

            if (!string.IsNullOrWhiteSpace(smtpUsername) && !string.IsNullOrWhiteSpace(smtpPassword))
            {
                await client.AuthenticateAsync(smtpUsername, smtpPassword, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            throw;
        }
    }

    private static string GetVerificationEmailTemplate(string username, string verificationLink)
    {
        return $@"
<!DOCTYPE html>
<html lang=""tr"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Email Doğrulama</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #e50914;
            margin: 0;
            font-size: 32px;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .content h2 {{
            color: #333;
            margin-top: 0;
        }}
        .button {{
            display: inline-block;
            background-color: #e50914;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 30px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
        }}
        .button:hover {{
            background-color: #b20710;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }}
        .link-text {{
            word-break: break-all;
            color: #666;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>🎬 CineFeel</h1>
        </div>
        <div class=""content"">
            <h2>Merhaba {username}!</h2>
            <p>CineFeel'e kayıt olduğunuz için teşekkürler! Hesabınızı aktifleştirmek için lütfen aşağıdaki butona tıklayarak email adresinizi doğrulayın.</p>
            <p style=""text-align: center;"">
                <a href=""{verificationLink}"" class=""button"">Email Adresimi Doğrula</a>
            </p>
            <p>Buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayıp yapıştırabilirsiniz:</p>
            <p class=""link-text"">{verificationLink}</p>
            <p><strong>Bu link 24 saat geçerlidir.</strong></p>
            <p>Eğer bu hesabı siz oluşturmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
        </div>
        <div class=""footer"">
            <p>&copy; 2024 CineFeel. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>";
    }

    private static string GetWelcomeEmailTemplate(string username)
    {
        return $@"
<!DOCTYPE html>
<html lang=""tr"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Hoş Geldiniz</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #e50914;
            margin: 0;
            font-size: 32px;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>🎬 CineFeel</h1>
        </div>
        <div class=""content"">
            <h2>Hoş Geldin {username}! 🎉</h2>
            <p>CineFeel ailesine katıldığın için çok mutluyuz!</p>
            <p>Artık yapabileceklerin:</p>
            <ul>
                <li>🎬 Binlerce film keşfet</li>
                <li>⭐ İzlediğin filmlere puan ver</li>
                <li>📝 Film yorumları yaz</li>
                <li>📋 İzleme listeleri oluştur</li>
                <li>❤️ Favori filmlerini kaydet</li>
                <li>👥 Diğer film severlerle bağlantı kur</li>
            </ul>
            <p>Keyifli keşifler!</p>
        </div>
        <div class=""footer"">
            <p>&copy; 2024 CineFeel. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>";
    }

    private static string GetPasswordResetEmailTemplate(string username, string resetLink)
    {
        return $@"
<!DOCTYPE html>
<html lang=""tr"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Şifre Sıfırlama</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #e50914;
            margin: 0;
            font-size: 32px;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .content h2 {{
            color: #333;
            margin-top: 0;
        }}
        .button {{
            display: inline-block;
            background-color: #e50914;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 30px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
        }}
        .button:hover {{
            background-color: #b20710;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }}
        .link-text {{
            word-break: break-all;
            color: #666;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>🎬 CineFeel</h1>
        </div>
        <div class=""content"">
            <h2>Merhaba {username}!</h2>
            <p>Şifrenizi sıfırlamak için bir istek aldık. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.</p>
            <p style=""text-align: center;"">
                <a href=""{resetLink}"" class=""button"">Şifremi Sıfırla</a>
            </p>
            <p>Buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayıp yapıştırabilirsiniz:</p>
            <p class=""link-text"">{resetLink}</p>
            <p><strong>Bu link 1 saat geçerlidir.</strong></p>
            <p>Eğer bu isteği siz yapmadıysanız, bu emaili görmezden gelebilirsiniz. Şifreniz değiştirilmeyecektir.</p>
        </div>
        <div class=""footer"">
            <p>&copy; 2024 CineFeel. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>";
    }
}
