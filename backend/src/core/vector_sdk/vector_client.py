"""Vector SDK — wrapper around ChromaDB for embedding storage and retrieval."""

from dataclasses import dataclass
from typing import Any


@dataclass
class VectorDocument:
    doc_id: str
    content: str
    embedding: list[float] | None = None
    metadata: dict[str, Any] | None = None


class VectorClient:
    """Manages prompt/asset embeddings in ChromaDB."""

    def __init__(self, host: str, port: int, collection_name: str) -> None:
        self.host = host
        self.port = port
        self.collection_name = collection_name
        self._client = None  # lazy init

    def _get_client(self):
        if self._client is None:
            import chromadb
            self._client = chromadb.HttpClient(host=self.host, port=self.port)
        return self._client

    def upsert(self, doc: VectorDocument) -> None:
        collection = self._get_client().get_or_create_collection(self.collection_name)
        collection.upsert(
            ids=[doc.doc_id],
            documents=[doc.content],
            embeddings=doc.embedding,
            metadatas=[doc.metadata or {}],
        )

    def query(self, query_text: str, n_results: int = 5) -> list[VectorDocument]:
        collection = self._get_client().get_or_create_collection(self.collection_name)
        results = collection.query(query_texts=[query_text], n_results=n_results)
        docs = []
        for i, doc_id in enumerate(results["ids"][0]):
            docs.append(VectorDocument(
                doc_id=doc_id,
                content=results["documents"][0][i],
                metadata=results["metadatas"][0][i],
            ))
        return docs
