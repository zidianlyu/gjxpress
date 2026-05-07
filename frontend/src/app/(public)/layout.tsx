import { SiteHeader } from '@/components/layout/SiteHeader';
import { PublicContactStrip } from '@/components/public/PublicContactStrip';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <PublicContactStrip />
      <PublicFooter />
    </>
  );
}
