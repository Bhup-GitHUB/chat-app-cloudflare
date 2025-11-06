import { Hono } from "hono";
import type { Bindings } from "./types";
import { createRoutes } from "./routes";
import { ChatRoom } from "./durable-objects/ChatRoom";

const app = new Hono<{ Bindings: Bindings }>();

createRoutes(app);

export default app;
export { ChatRoom };
