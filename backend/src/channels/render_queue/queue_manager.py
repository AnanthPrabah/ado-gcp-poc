"""Render Queue — priority queue abstraction over Redis/Celery."""

from dataclasses import dataclass, field
from enum import IntEnum


class Priority(IntEnum):
    LOW = 3
    NORMAL = 2
    HIGH = 1


@dataclass
class RenderJob:
    job_id: str
    prompt: str
    priority: Priority = Priority.NORMAL
    metadata: dict = field(default_factory=dict)


class RenderQueueManager:
    """Pushes and pops RenderJob items from the backing message broker."""

    def enqueue(self, job: RenderJob) -> str:
        """Add a job to the queue; return its task ID."""
        # TODO: publish to Celery via rail_bus
        raise NotImplementedError

    def dequeue(self) -> RenderJob | None:
        """Pop the highest-priority pending job."""
        # TODO: consume from Celery
        raise NotImplementedError
