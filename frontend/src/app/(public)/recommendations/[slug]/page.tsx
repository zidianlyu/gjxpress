import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, MapPin, Tag, Calendar, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';

// Mock data - in production this would come from API
const mockRecommendations: Record<string, {
  name: string;
  city: string;
  category: string;
  summary: string;
  content: string;
  tags: string[];
  tips: string[];
  updatedAt: string;
}> = {
  'los-angeles-chinese-supermarket-guide': {
    name: '洛杉矶华人超市指南',
    city: 'Los Angeles',
    category: 'chinese-supermarket',
    summary: '洛杉矶地区最受欢迎的华人超市推荐',
    content: `
      <p>洛杉矶作为美国华人最集中的城市之一，拥有众多优质的华人超市。</p>
      <h3>大华超级市场 (99 Ranch Market)</h3>
      <p>大华是洛杉矶地区最知名的华人连锁超市之一，提供新鲜蔬果、肉类海鲜、零食调料等各类亚洲食品。</p>
      <h3>香港超市</h3>
      <p>以香港特色商品著称，海鲜选择丰富，价格也较为实惠。</p>
      <h3>顺发超市</h3>
      <p>主要服务于圣盖博谷地区，提供新鲜的亚洲蔬果和各类生活用品。</p>
    `,
    tags: ['超市', '华人', '购物', '亚洲食品'],
    tips: [
      '周末人流量较大，建议工作日前往',
      '部分超市提供会员优惠，可以办理会员卡',
      '新鲜海鲜通常在早上到货',
    ],
    updatedAt: '2024-01-15',
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const rec = mockRecommendations[slug];

  if (!rec) {
    return {
      title: '推荐详情',
    };
  }

  return {
    title: rec.name,
    description: rec.summary,
    alternates: {
      canonical: `/recommendations/${slug}`,
    },
  };
}

export default async function RecommendationDetailPage({ params }: Props) {
  const { slug } = await params;
  const rec = mockRecommendations[slug];

  if (!rec) {
    notFound();
  }

  return (
    <>
      {/* Header */}
      <section className="py-8 bg-muted/50 border-b">
        <div className="container">
          <Link
            href="/recommendations"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回推荐列表
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <MapPin className="mr-1 h-3 w-3" />
              {rec.city}
            </span>
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium">
              <Tag className="mr-1 h-3 w-3" />
              {rec.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{rec.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{rec.summary}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: rec.content }}
              />

              {/* Tips */}
              <div className="mt-12 p-6 rounded-lg bg-amber-50 border border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-4">实用提示</h3>
                <ul className="space-y-2">
                  {rec.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-amber-800">
                      <span className="font-bold">{index + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Last Updated */}
              <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                最后更新：{rec.updatedAt}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tags */}
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-4">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {rec.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Links */}
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-4">相关推荐</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href={`/cities/${rec.city.toLowerCase().replace(' ', '-')}`}
                      className="flex items-center text-sm text-primary hover:underline"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {rec.city} 更多推荐
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/categories/${rec.category}`}
                      className="flex items-center text-sm text-primary hover:underline"
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      更多{rec.category}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">使用我们的服务</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  需要从中国购物寄到美国？试试我们的跨境物流服务。
                </p>
                <Link
                  href="/services/china-us-shipping"
                  className="inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  了解跨境物流
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
