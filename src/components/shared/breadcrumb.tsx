import Link from "next/link";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Link className="hover:text-foreground" href="/">
        PERSOS Intranet
      </Link>
      {items.map((item) => (
        <span className="flex items-center gap-2" key={item.label}>
          <span>/</span>
          {item.href ? (
            <Link className="hover:text-foreground" href={item.href}>
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
