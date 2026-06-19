"""Batch Console — submits large render jobs from CSV/JSON manifests."""

from pathlib import Path
from typing import Any


class BatchRunner:
    """Reads a manifest file and fans out render jobs to the Rail-Bus."""

    def __init__(self, manifest_path: Path) -> None:
        self.manifest_path = manifest_path

    def load_manifest(self) -> list[dict[str, Any]]:
        """Parse the job manifest (JSON or CSV)."""
        # TODO: implement JSON / CSV parsing
        raise NotImplementedError

    def submit_all(self) -> list[str]:
        """Submit every job in the manifest; return list of job IDs."""
        jobs = self.load_manifest()
        job_ids: list[str] = []
        for job in jobs:
            # TODO: enqueue via rail_bus.publish(job)
            job_ids.append(job.get("id", "unknown"))
        return job_ids
