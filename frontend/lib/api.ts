const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ExplainResponse {
  explanation: string;
}

export async function explainRepo(repoUrl: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl, stream: false }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to explain repo");
  }

  const data = await response.json();
  return data.explanation;
}

export async function streamExplainRepo(
  repoUrl: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: string) => void
) {
  try {
    const response = await fetch(`${API_URL}/api/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo_url: repoUrl, stream: true }),
    });

    if (!response.ok) {
      const error = await response.json();
      onError(error.detail || "Failed to explain repo");
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      onError("No response body");
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) onChunk(parsed.text);
          } catch {}
        }
      }
    }
    onDone();
  } catch (error) {
    onError(error instanceof Error ? error.message : "Unknown error");
  }
}