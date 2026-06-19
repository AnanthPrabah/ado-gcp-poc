"""Secret Manager — retrieves secrets from GCP Secret Manager."""

import os


class SecretManagerClient:
    def __init__(self, project_id: str | None = None) -> None:
        self.project_id = project_id or os.environ["GCP_PROJECT_ID"]
        self._client = None

    def _get_client(self):
        if self._client is None:
            from google.cloud import secretmanager
            self._client = secretmanager.SecretManagerServiceClient()
        return self._client

    def get_secret(self, secret_id: str, version: str = "latest") -> str:
        """Fetch a secret value by ID."""
        name = f"projects/{self.project_id}/secrets/{secret_id}/versions/{version}"
        response = self._get_client().access_secret_version(request={"name": name})
        return response.payload.data.decode("utf-8")
