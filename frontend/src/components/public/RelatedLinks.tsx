import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface RelatedLink {
  label: string;
  href: string;
}

interface RelatedLinksProps {
  title?: string;
  links: RelatedLink[];
  className?: string;
  flush?: boolean;
}

export function RelatedLinks({ 
  title = "相关链接", 
  links, 
  className = "",
  flush = false,
}: RelatedLinksProps) {
  if (!links.length) return null;

  return (
    <div className={`${flush ? '' : 'mt-12 border-t border-border pt-8'} ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <span className="text-sm font-medium">{link.label}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
