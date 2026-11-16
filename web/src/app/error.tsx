"use client";

import { useEffect } from "react";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
      <h1 className="text-3xl font-extrabold text-navy">Não conseguimos carregar esta página</h1>
      <p className="mt-2 text-muted-foreground">Tente de novo em instantes.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-cream"
      >
        Tentar de novo
      </button>
    </div>
  );
}
