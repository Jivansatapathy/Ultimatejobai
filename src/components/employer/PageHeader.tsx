import { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
      <div>
        <span className="inline-block rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
          {eyebrow}
        </span>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight lg:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
