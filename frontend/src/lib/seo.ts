import type { Metadata } from 'next';
import { siteConfig } from './site-config';

export function buildPageTitle(title?: string): string {
  if (!title) return `${siteConfig.name} | ${siteConfig.slogan}`;
  if (title.includes(siteConfig.name)) return title;
  return `${title} | ${siteConfig.name}`;
}

export function buildCanonical(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.url}${normalized === '/' ? '' : normalized}`;
}

export interface BuildMetadataOptions {
  title?: string;
  description?: string;
  path: string;
  noIndex?: boolean;
  image?: string;
  type?: 'website' | 'article';
}

export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const {
    title,
    description = siteConfig.description,
    path,
    noIndex = false,
    image,
    type = 'website',
  } = options;

  const fullTitle = buildPageTitle(title);
  const canonical = buildCanonical(path);

  const metadata: Metadata = {
    title: fullTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: image ? [{ url: image, width: 1200, height: 630, alt: fullTitle }] : [
        {
          url: '/opengraph-image.png',
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - ${siteConfig.slogan}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image ? [image] : ['/twitter-image.png'],
    },
  };

  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    };
  }

  return metadata;
}
