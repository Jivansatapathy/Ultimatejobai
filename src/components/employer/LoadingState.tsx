export function LoadingState({ label = "Loading employer workspace..." }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="relative h-10 w-10 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-600 animate-spin" />
      </div>
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="mt-1 text-sm text-gray-400">This may take a few seconds…</p>
    </div>
  );
}
