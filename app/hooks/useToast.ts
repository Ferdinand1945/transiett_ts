"use client";

import { useCallback, useState } from "react";

export type ToastType = "success" | "error";

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<ToastType>("success");

  const showToast = useCallback((text: string, type: ToastType = "success") => {
    setMessage(text);
    setMessageType(type);
  }, []);

  const clearToast = useCallback(() => {
    setMessage(null);
  }, []);

  return { message, messageType, showToast, clearToast };
}
