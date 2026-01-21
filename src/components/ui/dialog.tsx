"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

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

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 overflow-y-auto"
      onClick={() => onOpenChange(false)}
    >
      {/* CONTEÚDO */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>
  );

  // Renderiza o modal usando portal para garantir que fique acima de tudo
  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}

// ======================================================
// CONTEÚDO DO MODAL
// ======================================================

import { cn } from "../../lib/utils";

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-navy-deep rounded-xl shadow-xl p-6 w-full max-w-md", className)}>
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

// ======================================================
// DESCRIÇÃO
// ======================================================

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-400 mt-2">{children}</p>;
}
