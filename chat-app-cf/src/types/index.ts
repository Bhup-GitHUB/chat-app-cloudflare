export type Bindings = {
  ROOM: DurableObjectNamespace;
};

export type ChatMessage =
  | { type: "sys"; text: string }
  | { type: "chat"; name: string; text: string };

