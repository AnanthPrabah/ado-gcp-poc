"""Unit tests for RenderQueueManager models."""

import pytest
from src.channels.render_queue.queue_manager import RenderJob, Priority


def test_render_job_default_priority():
    job = RenderJob(job_id="j1", prompt="A sunset over mountains")
    assert job.priority == Priority.NORMAL


def test_render_job_high_priority():
    job = RenderJob(job_id="j2", prompt="...", priority=Priority.HIGH)
    assert job.priority < Priority.NORMAL  # HIGH (1) < NORMAL (2)
