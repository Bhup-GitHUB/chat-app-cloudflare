import type { ChatMessage } from "../types";

export class ChatRoom {
  state: DurableObjectState;
  sockets: Set<WebSocket>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sockets = new Set();
  }

  async fetch(request: Request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const name = request.headers.get("X-Client-Name") ?? "anon";

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();

    const ws = server as unknown as WebSocket;
    this.sockets.add(ws);

    this.broadcast({ type: "sys", text: `${name} joined` });

    ws.addEventListener("message", (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data as string);
        if (data.type === "chat" && typeof data.text === "string") {
          this.broadcast({ type: "chat", name, text: data.text });
        }
      } catch {}
    });

    const cleanup = () => {
      this.sockets.delete(ws);
      this.broadcast({ type: "sys", text: `${name} left` });
    };
    ws.addEventListener("close", cleanup);
    ws.addEventListener("error", cleanup);

    return new Response(null, { status: 101, webSocket: client });
  }

  private broadcast(msg: ChatMessage) {
    const payload = JSON.stringify(msg);
    for (const ws of [...this.sockets]) {
      try {
        ws.send(payload);
      } catch {
        this.sockets.delete(ws);
      }
    }
  }
}

