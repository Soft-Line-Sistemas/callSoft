"use client";

import React, { useEffect } from "react";

// ======================================================
// DIALOG (WRAPPER)
// ======================================================

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  // Fecha com ESC
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }

    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={() => onOpenChange(false)}
    >
      {/* CONTEÚDO */}
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ======================================================
// CONTEÚDO DO MODAL
// ======================================================

export function DialogContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-navy-deep rounded-xl shadow-xl p-6 w-full max-w-md">
      {children}
    </div>
  );
}

// ======================================================
// HEADER
// ======================================================

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

// ======================================================
// TÍTULO
// ======================================================

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}
