"use client";

import { useEffect } from "react";
import { reportFrontendError } from "@/lib/monitoring";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void reportFrontendError(error, { errorId: error.digest });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h2 className="text-xl font-semibold">Erro inesperado</h2>
          <p className="max-w-md text-sm">
            Ocorreu um erro inesperado. Tente novamente. Se o problema persistir, contate o suporte.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded bg-black px-4 py-2 text-white hover:opacity-90"
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
