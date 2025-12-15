"use client";

import React, { createContext, useContext, useState } from "react";

// ======================================================
// CONTEXTO
// ======================================================

type TabsContextType = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

// ======================================================
// TABS (CONTAINER)
// ======================================================

export function Tabs({
  defaultValue,
  children,
}: {
  defaultValue: string;
  children: React.ReactNode;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className="space-y-4">{children}</div>
    </TabsContext.Provider>
  );
}

// ======================================================
// LISTA DE ABAS
// ======================================================

export function TabsList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 border-b border-white/10 pb-2">
      {children}
    </div>
  );
}

// ======================================================
// BOTÃO DA ABA
// ======================================================

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;

  const active = ctx.value === value;

  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={`px-4 py-2 rounded-md text-sm transition
        ${
          active
            ? "bg-white/10 text-white"
            : "text-white/60 hover:text-white"
        }`}
    >
      {children}
    </button>
  );
}

// ======================================================
// CONTEÚDO DA ABA
// ======================================================

export function TabsContent({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx || ctx.value !== value) return null;

  return <div>{children}</div>;
}
