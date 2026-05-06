import { siteConfig } from './site-config';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    alternateName: siteConfig.englishName,
    url: siteConfig.url,
    description: siteConfig.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
  };
}

export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    alternateName: siteConfig.englishName,
    url: siteConfig.url,
    description: siteConfig.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry,
    },
    areaServed: [
      'Santa Clara',
      'Bay Area',
      'United States',
      'China',
    ],
    knowsAbout: [
      '中国到美国跨境物流信息服务',
      '包裹入库记录',
      '合箱整理',
      '物流状态查询',
    ],
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${siteConfig.url}${item.path === '/' ? '' : item.path}`,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

export function buildFaqJsonLd(faqs: FaqItem[]) {
  const mainEntity = faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };
}
