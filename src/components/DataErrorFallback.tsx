export function DataErrorFallback({ error }: { error: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-4">
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center max-w-md">
        <p className="text-sm font-semibold text-destructive mb-2">⚠️</p>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    </div>
  );
}
