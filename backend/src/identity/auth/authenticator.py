"""Authentication — JWT validation and API-key verification."""

from datetime import datetime, timedelta

import jwt
from pydantic import BaseModel


class TokenPayload(BaseModel):
    sub: str
    exp: datetime
    roles: list[str] = []


class Authenticator:
    def __init__(self, secret: str, algorithm: str = "HS256") -> None:
        self.secret = secret
        self.algorithm = algorithm

    def create_token(self, subject: str, roles: list[str], ttl_minutes: int = 60) -> str:
        payload = {
            "sub": subject,
            "roles": roles,
            "exp": datetime.utcnow() + timedelta(minutes=ttl_minutes),
        }
        return jwt.encode(payload, self.secret, algorithm=self.algorithm)

    def verify_token(self, token: str) -> TokenPayload:
        decoded = jwt.decode(token, self.secret, algorithms=[self.algorithm])
        return TokenPayload(**decoded)
