import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbsProps } from "./types";

function jsonLdBreadcrumbs(items: BreadcrumbsProps["items"]) {
  const listItems = items.map((item, i) => ({
    "@type": "ListItem" as const,
    position: i + 1,
    item: item.href
      ? { "@id": `https://pumpkin.quest${item.href}/`, name: item.label }
      : { name: item.label },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  };
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdBreadcrumbs(items)),
        }}
      />
      <nav className="flex items-center gap-1 text-sm text-pumpkin-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} className="text-pumpkin-muted" />}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-pumpkin-text transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-pumpkin-text" : undefined}>
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
