"use client";

import { useEffect } from "react";
import { reportFrontendError } from "@/lib/monitoring";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void reportFrontendError(error, { errorId: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-semibold">Algo deu errado</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Ocorreu um erro inesperado. Tente novamente. Se o problema persistir, contate o suporte.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
      >
        Tentar novamente
      </button>
    </div>
  );
}
