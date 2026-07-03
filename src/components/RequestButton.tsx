"use client";

import React from "react";

import { useState } from "react";

type RequestButtonProps = {
  requesterId: string;
  targetId: string;
};

export function RequestButton({ requesterId, targetId }: RequestButtonProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function requestCheckin() {
    setStatus("sending");
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ requesterId, targetId }),
    });

    setStatus(response.ok ? "sent" : "error");
  }

  return (
    <button className="requestButton" disabled={status === "sending"} onClick={requestCheckin}>
      {status === "sent" ? "요청 완료" : "ㅇㅊㅇ 요청"}
    </button>
  );
}