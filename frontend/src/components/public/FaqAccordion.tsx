'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FaqItem } from '@/lib/faq';

interface FaqAccordionProps {
  faqs: FaqItem[];
  className?: string;
}

export default function FaqAccordion({ faqs, className = '' }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border rounded-lg bg-card overflow-hidden transition-all duration-200 hover:shadow-sm"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset"
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
          >
            <h3 className="font-semibold text-base pr-4 leading-relaxed">
              {faq.question}
            </h3>
            <div className="flex-shrink-0">
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>
          
          <div
            id={`faq-answer-${index}`}
            className={`transition-all duration-200 ease-in-out ${
              openIndex === index
                ? 'max-h-96 opacity-100'
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
