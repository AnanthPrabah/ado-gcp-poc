"""Prompt Management — CRUD and versioning for prompt templates."""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class PromptTemplate:
    template_id: str
    name: str
    body: str
    version: int = 1
    tags: list[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)


class PromptManager:
    """Stores and retrieves prompt templates from Cloud SQL."""

    def save(self, template: PromptTemplate) -> PromptTemplate:
        # TODO: persist to storage.cloud_sql
        raise NotImplementedError

    def get(self, template_id: str) -> PromptTemplate:
        # TODO: fetch from storage.cloud_sql
        raise NotImplementedError

    def list_all(self) -> list[PromptTemplate]:
        # TODO: query storage.cloud_sql
        raise NotImplementedError
