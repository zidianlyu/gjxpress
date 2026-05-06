import type { FaqItem, FaqCategory } from '@/lib/faq';
import FaqAccordion from './FaqAccordion';

interface FaqSectionProps {
  title?: string;
  description?: string;
  faqs: FaqItem[];
  categories?: FaqCategory[];
  showCategories?: boolean;
  className?: string;
}

export default function FaqSection({
  title = '常见问题',
  description,
  faqs,
  categories,
  showCategories = false,
  className = '',
}: FaqSectionProps) {
  if (showCategories && categories) {
    return (
      <div className={`space-y-12 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
        
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
            <FaqAccordion faqs={category.items} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>
      
      <FaqAccordion faqs={faqs} />
    </div>
  );
}
