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
    telephone: siteConfig.publicContacts.us.phone,
    description: `${siteConfig.description}${siteConfig.publicLocationSummary}`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: siteConfig.publicContacts.domestic.label,
        telephone: siteConfig.publicContacts.domestic.phone,
        availableLanguage: ['zh-CN'],
      },
      {
        '@type': 'ContactPoint',
        contactType: siteConfig.publicContacts.us.label,
        telephone: siteConfig.publicContacts.us.phone,
        availableLanguage: ['zh-CN', 'en-US'],
      },
    ],
    areaServed: siteConfig.serviceAreas,
  };
}

export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    alternateName: siteConfig.englishName,
    url: siteConfig.url,
    telephone: siteConfig.publicContacts.us.phone,
    description: `${siteConfig.description}${siteConfig.publicLocationSummary}`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: siteConfig.publicContacts.domestic.label,
        telephone: siteConfig.publicContacts.domestic.phone,
        availableLanguage: ['zh-CN'],
      },
      {
        '@type': 'ContactPoint',
        contactType: siteConfig.publicContacts.us.label,
        telephone: siteConfig.publicContacts.us.phone,
        availableLanguage: ['zh-CN', 'en-US'],
      },
    ],
    areaServed: siteConfig.serviceAreas,
    knowsAbout: [
      '中国到美国跨境物流信息服务',
      '包裹入库记录',
      '合箱整理',
      '物流状态查询',
      '本地递送安排',
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
