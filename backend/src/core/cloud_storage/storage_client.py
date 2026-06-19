"""Core Cloud Storage client — GCS upload / download abstraction."""

from pathlib import Path


class StorageClient:
    """Thin wrapper over google-cloud-storage (or local filesystem in dev)."""

    def __init__(self, bucket_name: str, backend: str = "gcs") -> None:
        self.bucket_name = bucket_name
        self.backend = backend
        self._gcs_client = None

    def _get_bucket(self):
        if self.backend == "local":
            return None
        from google.cloud import storage
        if self._gcs_client is None:
            self._gcs_client = storage.Client()
        return self._gcs_client.bucket(self.bucket_name)

    def upload(self, local_path: Path, destination: str) -> str:
        """Upload a file and return its public/signed URL."""
        if self.backend == "local":
            dest = Path("./local_storage") / destination
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(local_path.read_bytes())
            return str(dest)
        bucket = self._get_bucket()
        blob = bucket.blob(destination)
        blob.upload_from_filename(str(local_path))
        return f"gs://{self.bucket_name}/{destination}"

    def download(self, source: str, local_path: Path) -> Path:
        """Download a file from storage to a local path."""
        if self.backend == "local":
            src = Path("./local_storage") / source
            local_path.write_bytes(src.read_bytes())
            return local_path
        bucket = self._get_bucket()
        bucket.blob(source).download_to_filename(str(local_path))
        return local_path
