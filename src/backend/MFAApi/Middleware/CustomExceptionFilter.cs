using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace MFAApi.Middleware;

public class CustomExceptionFilter : IExceptionFilter
{
    private readonly ILogger<CustomExceptionFilter> _logger;

    public CustomExceptionFilter(ILogger<CustomExceptionFilter> logger)
    {
        _logger = logger;
    }

    public void OnException(ExceptionContext context)
    {
        _logger.LogError(context.Exception, "Exceção não tratada: {Message}", context.Exception.Message);

        var statusCode = HttpStatusCode.InternalServerError;
        var message = "Ocorreu um erro ao processar a sua solicitação.";

        // Customizar o status code e a mensagem com base no tipo de exceção
        if (context.Exception is UnauthorizedAccessException)
        {
            statusCode = HttpStatusCode.Unauthorized;
            message = context.Exception.Message;
        }
        else if (context.Exception is ArgumentException)
        {
            statusCode = HttpStatusCode.BadRequest;
            message = context.Exception.Message;
        }
        else if (context.Exception is InvalidOperationException)
        {
            statusCode = HttpStatusCode.Conflict;
            message = context.Exception.Message;
        }

        // Criar resposta personalizada
        var result = new ObjectResult(new
        {
            statusCode = (int)statusCode,
            message
        })
        {
            StatusCode = (int)statusCode
        };

        context.Result = result;
        context.ExceptionHandled = true;
    }
}
