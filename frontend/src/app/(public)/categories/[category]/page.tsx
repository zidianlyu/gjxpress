import type { Metadata } from 'next';
import Link from 'next/link';
import { Tag, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/constants';
import { EmptyState } from '@/components/common/EmptyState';

interface Props {
  params: Promise<{ category: string }>;
}

// Supported categories
const validCategories = ['chinese-supermarket', 'restaurants', 'local-services'];

const categoryNames: Record<string, string> = {
  'chinese-supermarket': '华人超市',
  restaurants: '餐厅推荐',
  'local-services': '本地服务',
};

const categoryDescriptions: Record<string, string> = {
  'chinese-supermarket': '精选美国各地的华人超市，满足您的亚洲食品购物需求',
  restaurants: '推荐美国各地优质中餐厅，品尝家乡味道',
  'local-services': '为在美华人精选的本地生活服务资源',
};

// Mock recommendations by category
const mockCategoryRecommendations: Record<string, Array<{
  id: string;
  slug: string;
  name: string;
  city: string;
  summary: string;
}>> = {
  'chinese-supermarket': [
    {
      id: '1',
      slug: 'los-angeles-chinese-supermarket-guide',
      name: '洛杉矶华人超市指南',
      city: 'Los Angeles',
      summary: '洛杉矶地区最受欢迎的华人超市推荐',
    },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categoryName = categoryNames[category] || category;

  return {
    title: categoryName,
    description: categoryDescriptions[category] || `${categoryName}推荐`,
    alternates: {
      canonical: `/categories/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (!validCategories.includes(category)) {
    notFound();
  }

  const categoryName = categoryNames[category] || category;
  const categoryDescription = categoryDescriptions[category] || '';
  const recommendations = mockCategoryRecommendations[category] || [];
  const hasRecommendations = recommendations.length > 0;

  return (
    <>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
              <Tag className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{categoryName}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{categoryDescription}</p>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-semibold mb-8">相关推荐</h2>
          {hasRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Link key={rec.id} href={`/recommendations/${rec.slug}`}>
                  <div className="h-full p-6 rounded-lg border bg-card transition-colors hover:border-primary/50">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary mb-3">
                      {rec.city}
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
              description={`${categoryName}类别的推荐内容正在筹备中，敬请期待`}
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
              {SITE_CONFIG.brandDisplayName}为美国华人提供中美跨境物流信息服务
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
