"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextType = {
  showToast: (t: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, ...t };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-4 right-4 z-[1000] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-[260px] max-w-[360px] rounded-md shadow-lg border p-3 bg-white ${
            t.variant === "success"
              ? "border-green-200"
              : t.variant === "error"
              ? "border-red-200"
              : "border-gray-200"
          }`}
        >
          {t.title && (
            <div className="text-sm font-semibold mb-1">
              {t.title}
            </div>
          )}
          {t.description && (
            <div className="text-sm text-gray-600">{t.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
