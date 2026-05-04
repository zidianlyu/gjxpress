import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Tag, Search } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { EmptyState } from '@/components/common/EmptyState';

export const metadata: Metadata = {
  title: '本地推荐',
  description: `浏览${SITE_CONFIG.name}为美国华人社区精选的本地生活推荐，包括华人超市、餐厅、本地服务等。`,
};

// Mock recommendations data for demonstration
const mockRecommendations = [
  {
    id: '1',
    slug: 'los-angeles-chinese-supermarket-guide',
    name: '洛杉矶华人超市指南',
    city: 'Los Angeles',
    category: 'chinese-supermarket',
    summary: '洛杉矶地区最受欢迎的华人超市推荐，包括大华、香港超市等。',
    tags: ['超市', '华人', '购物'],
  },
  {
    id: '2',
    slug: 'san-gabriel-valley-restaurants',
    name: '圣盖博谷餐厅推荐',
    city: 'San Gabriel',
    category: 'restaurants',
    summary: '圣盖博谷地区精选中餐厅推荐，川菜、粤菜、台湾菜应有尽有。',
    tags: ['餐厅', '中餐', '美食'],
  },
  {
    id: '3',
    slug: 'irvine-asian-grocery-stores',
    name: '尔湾亚洲超市指南',
    city: 'Irvine',
    category: 'chinese-supermarket',
    summary: '尔湾及周边地区亚洲超市推荐，满足日常购物需求。',
    tags: ['超市', '亚洲食品', '购物'],
  },
];

const cities = ['Los Angeles', 'San Francisco', 'New York', 'Seattle', 'Irvine'];
const categories = [
  { id: 'chinese-supermarket', label: '华人超市' },
  { id: 'restaurants', label: '餐厅推荐' },
  { id: 'local-services', label: '本地服务' },
];

export default function RecommendationsPage() {
  const hasRecommendations = mockRecommendations.length > 0;

  return (
    <>
      {/* Header */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight">本地推荐</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              为美国华人社区精选的本地生活资源
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索推荐..."
                className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
              />
            </div>

            {/* City Filter */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <select className="rounded-md border bg-background px-3 py-2">
                <option value="">所有城市</option>
                {cities.map((city) => (
                  <option key={city} value={city.toLowerCase().replace(' ', '-')}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
              <select className="rounded-md border bg-background px-3 py-2">
                <option value="">所有分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations List */}
      <section className="py-16">
        <div className="container">
          {hasRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockRecommendations.map((rec) => (
                <Link key={rec.id} href={`/recommendations/${rec.slug}`}>
                  <div className="h-full p-6 rounded-lg border bg-card transition-colors hover:border-primary/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {rec.city}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium">
                        {categories.find((c) => c.id === rec.category)?.label || rec.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{rec.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{rec.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="暂无推荐内容"
              description="推荐内容正在筹备中，敬请期待"
              icon="search"
            />
          )}
        </div>
      </section>

      {/* Cities & Categories */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Cities */}
            <div>
              <h2 className="text-xl font-semibold mb-6">按城市浏览</h2>
              <div className="flex flex-wrap gap-3">
                {cities.map((city) => (
                  <Link
                    key={city}
                    href={`/cities/${city.toLowerCase().replace(' ', '-')}`}
                    className="inline-flex items-center rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {city}
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h2 className="text-xl font-semibold mb-6">按分类浏览</h2>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.id}`}
                    className="inline-flex items-center rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
