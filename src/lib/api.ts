const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface Product {
  id: number;
  title: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  image_url: string | null;
}

export interface ChatResponse {
  answer: string;
  products: Product[];
}

export async function fetchProducts(
  query?: string,
  category?: string
): Promise<Product[]> {
  const params = new URLSearchParams({ limit: "20" });
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  const res = await fetch(`${API_BASE}/api/v1/products?${params}`);
  if (!res.ok) throw new Error(`Products request failed: ${res.status}`);
  return res.json() as Promise<Product[]>;
}

export function streamChat(
  sessionId: string,
  message: string,
  onProducts: (products: Product[]) => void,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): void {
  fetch(`${API_BASE}/api/v1/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  })
    .then(async (res) => {
      if (!res.ok || !res.body) throw new Error(`Stream failed: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          if (!chunk.startsWith("data:")) continue;
          const raw = chunk.replace(/^data:\s*/, "").trim();
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw) as {
              token?: string;
              done?: boolean;
              products?: Product[];
            };
            if (parsed.products) onProducts(parsed.products);
            if (parsed.token) onToken(parsed.token);
            if (parsed.done) onDone();
          } catch {
            /* ignore malformed chunks */
          }
        }
      }
    })
    .catch((err: Error) => onError(err));
}
