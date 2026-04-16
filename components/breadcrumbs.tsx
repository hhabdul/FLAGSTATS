import Link from "next/link";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="rounded-full px-2 py-1 hover:bg-white/5 hover:text-ink-primary">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="rounded-full bg-white/5 px-2 py-1 text-ink-primary">
                {item.label}
              </span>
            )}
            {index < items.length - 1 ? <span>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
