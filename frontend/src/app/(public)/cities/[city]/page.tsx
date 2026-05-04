import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/constants';
import { EmptyState } from '@/components/common/EmptyState';

interface Props {
  params: Promise<{ city: string }>;
}

// Supported cities
const validCities = ['los-angeles', 'new-york', 'san-francisco', 'seattle', 'irvine'];

const cityNames: Record<string, string> = {
  'los-angeles': '洛杉矶',
  'new-york': '纽约',
  'san-francisco': '旧金山',
  seattle: '西雅图',
  irvine: '尔湾',
};

// Mock recommendations by city
const mockCityRecommendations: Record<string, Array<{
  id: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
}>> = {
  'los-angeles': [
    {
      id: '1',
      slug: 'los-angeles-chinese-supermarket-guide',
      name: '洛杉矶华人超市指南',
      category: 'chinese-supermarket',
      summary: '洛杉矶地区最受欢迎的华人超市推荐',
    },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityName = cityNames[city] || city;

  return {
    title: `${cityName}华人生活推荐`,
    description: `探索${cityName}的华人超市、餐厅和本地生活服务推荐，为在美华人提供实用的生活信息。`,
    alternates: {
      canonical: `/cities/${city}`,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;

  if (!validCities.includes(city)) {
    notFound();
  }

  const cityName = cityNames[city] || city;
  const recommendations = mockCityRecommendations[city] || [];
  const hasRecommendations = recommendations.length > 0;

  return (
    <>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{cityName}</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {cityName}地区华人生活服务推荐
            </p>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-semibold mb-8">本地推荐</h2>
          {hasRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Link key={rec.id} href={`/recommendations/${rec.slug}`}>
                  <div className="h-full p-6 rounded-lg border bg-card transition-colors hover:border-primary/50">
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium mb-3">
                      {rec.category}
                    </span>
                    <h3 className="text-lg font-semibold mb-2">{rec.name}</h3>
                    <p className="text-sm text-muted-foreground">{rec.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="暂无推荐内容"
              description={`${cityName}地区的推荐内容正在筹备中，敬请期待`}
              icon="search"
            />
          )}
        </div>
      </section>

      {/* Service CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold mb-4">需要跨境物流服务？</h2>
            <p className="text-muted-foreground mb-6">
              {SITE_CONFIG.brandDisplayName}为{cityName}地区华人提供中美跨境物流信息服务
            </p>
            <Link
              href="/services/china-us-shipping"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              了解跨境物流服务
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
