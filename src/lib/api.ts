import { MOCK_PRODUCTS } from "@/lib/mock-products";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

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

const hasBackend = Boolean(API_BASE);

export async function fetchProducts(
  query?: string,
  category?: string
): Promise<Product[]> {
  if (!hasBackend) return MOCK_PRODUCTS;
  const params = new URLSearchParams({ limit: "20" });
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  const res = await fetch(`${API_BASE}/api/v1/products?${params}`);
  if (!res.ok) throw new Error(`Products request failed: ${res.status}`);
  return res.json() as Promise<Product[]>;
}

function getMockChatResponse(message: string): { text: string; products: Product[] } {
  const msg = message.toLowerCase();
  let matched: Product[] = [];

  if (msg.includes("headset") || msg.includes("headphone") || msg.includes("audio")) {
    matched = MOCK_PRODUCTS.filter((p) => p.category === "Audio").slice(0, 3);
  } else if (msg.includes("mouse") || msg.includes("keyboard") || msg.includes("peripheral")) {
    matched = MOCK_PRODUCTS.filter((p) => p.category === "Peripherals").slice(0, 3);
  } else if (msg.includes("watch") || msg.includes("wearable") || msg.includes("fitness")) {
    matched = MOCK_PRODUCTS.filter((p) => p.category === "Wearables").slice(0, 3);
  } else if (msg.includes("speaker") || msg.includes("bluetooth")) {
    matched = MOCK_PRODUCTS.filter((p) => p.title.toLowerCase().includes("speaker")).slice(0, 3);
  } else if (msg.includes("deal") || msg.includes("cheap") || msg.includes("budget") || msg.includes("under")) {
    matched = [...MOCK_PRODUCTS].sort((a, b) => a.price - b.price).slice(0, 3);
  } else if (msg.includes("gaming")) {
    matched = MOCK_PRODUCTS.filter((p) => p.title.toLowerCase().includes("gaming") || p.brand === "Razer" || p.brand === "Logitech").slice(0, 3);
  } else if (msg.includes("work from home") || msg.includes("setup") || msg.includes("office")) {
    matched = MOCK_PRODUCTS.filter((p) => ["Peripherals", "Audio"].includes(p.category)).slice(0, 4);
  } else {
    matched = MOCK_PRODUCTS.slice(0, 3);
  }

  const productList = matched.map((p) => `• **${p.title}** — $${p.price} (${p.brand})`).join("\n");
  const text = `Great question! Here are my top recommendations:\n\n${productList}\n\nThese are excellent choices based on quality, value, and user reviews. Would you like more details on any of these? 🛍️`;

  return { text, products: matched };
}

export function streamChat(
  sessionId: string,
  message: string,
  onProducts: (products: Product[]) => void,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): void {
  if (!hasBackend) {
    // Simulate streaming with mock data
    const { text, products } = getMockChatResponse(message);
    setTimeout(() => onProducts(products), 300);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        const chunk = text.slice(i, i + 3);
        onToken(chunk);
        i += 3;
      } else {
        clearInterval(interval);
        onDone();
      }
    }, 20);
    return;
  }

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
