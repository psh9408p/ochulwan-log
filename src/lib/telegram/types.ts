export type ParsedTelegramText =
  | { type: "checkin" }
  | { type: "register" }
  | { type: "request"; targetName: string }
  | { type: "unknown" };