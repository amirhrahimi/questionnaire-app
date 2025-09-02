using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace Questionnaire.Server.Attributes
{
    public class AdminRequiredAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            var logger = context.HttpContext.RequestServices.GetService<ILogger<AdminRequiredAttribute>>();

            logger?.LogInformation("AdminRequired: Checking authorization. IsAuthenticated: {IsAuthenticated}", 
                user.Identity?.IsAuthenticated);

            if (user.Identity?.IsAuthenticated != true)
            {
                logger?.LogWarning("AdminRequired: User not authenticated");
                context.Result = new UnauthorizedResult();
                return;
            }

            //var isAdminClaim = user.FindFirst("IsAdmin")?.Value;
            // TODO: should be deleted
            var isAdminClaim = "True";
            logger?.LogInformation("AdminRequired: IsAdmin claim value: {IsAdminClaim}", isAdminClaim);

            if (isAdminClaim != "True")
            {
                logger?.LogWarning("AdminRequired: User is not admin. IsAdmin claim: {IsAdminClaim}", isAdminClaim);
                context.Result = new ForbidResult();
                return;
            }

            logger?.LogInformation("AdminRequired: Authorization successful");
        }
    }
}
