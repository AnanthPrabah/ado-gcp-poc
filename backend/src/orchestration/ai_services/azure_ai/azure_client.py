"""Azure AI client — alternative image generation and content safety."""

import os
from azure.ai.inference import ChatCompletionsClient
from azure.core.credentials import AzureKeyCredential


class AzureAIClient:
    def __init__(self) -> None:
        self.endpoint = os.environ["AZURE_ENDPOINT"]
        self.api_key = os.environ["AZURE_API_KEY"]
        self.deployment = os.getenv("AZURE_DEPLOYMENT_NAME", "gpt-4o")
        self._client: ChatCompletionsClient | None = None

    def _get_client(self) -> ChatCompletionsClient:
        if self._client is None:
            self._client = ChatCompletionsClient(
                endpoint=self.endpoint,
                credential=AzureKeyCredential(self.api_key),
            )
        return self._client

    def complete(self, messages: list[dict]) -> str:
        """Send a chat completion request and return the reply text."""
        from azure.ai.inference.models import UserMessage, SystemMessage
        response = self._get_client().complete(
            model=self.deployment,
            messages=messages,
        )
        return response.choices[0].message.content
