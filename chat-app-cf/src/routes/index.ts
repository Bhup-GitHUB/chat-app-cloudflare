import { Hono } from "hono";
import type { Bindings } from "../types";

export function createRoutes(app: Hono<{ Bindings: Bindings }>) {
  app.get("/", (c) => c.text("Chat backend running ✅"));
  app.get("/health", (c) => c.json({ ok: true }));

  app.get("/ws/:room", async (c) => {
    const room = c.req.param("room") || "general";
    const url = new URL(c.req.url);
    const name = url.searchParams.get("name") ?? "anon";

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    const id = c.env.ROOM.idFromName(room);
    const stub = c.env.ROOM.get(id);

    await stub.fetch("https://do/room", {
      headers: {
        Upgrade: "websocket",
        "X-Client-Name": name,
      },
      webSocket: server,
    });

    return new Response(null, { status: 101, webSocket: client });
  });
}

