import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <Package className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-xl text-muted-foreground mb-2">页面未找到</p>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        抱歉，您访问的页面不存在。请返回首页或尝试其他链接。
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </Link>
    </div>
  );
}
