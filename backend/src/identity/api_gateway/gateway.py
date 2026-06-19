"""API Gateway — request validation, rate limiting, and routing middleware."""

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

from src.identity.auth.authenticator import Authenticator


class APIGatewayMiddleware(BaseHTTPMiddleware):
    """Validates Bearer tokens / API keys on every inbound request."""

    PUBLIC_PATHS = {"/health", "/", "/docs", "/openapi.json"}

    def __init__(self, app, authenticator: Authenticator) -> None:
        super().__init__(app)
        self.authenticator = authenticator

    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.PUBLIC_PATHS:
            return await call_next(request)

        token = self._extract_token(request)
        if not token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

        try:
            payload = self.authenticator.verify_token(token)
            request.state.user = payload
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        return await call_next(request)

    @staticmethod
    def _extract_token(request: Request) -> str | None:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            return auth[7:]
        return request.headers.get("X-API-Key")
