import Link from 'next/link';
import { MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

const contacts = [siteConfig.publicContacts.domestic, siteConfig.publicContacts.us];

export function PublicContactHighlight() {
  return (
    <section className="bg-gradient-to-b from-white to-blue-50/70 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-blue-200 bg-white shadow-lg shadow-blue-100/70">
          <div className="border-b border-blue-100 bg-blue-50 px-5 py-3">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              第一次使用广骏？
            </span>
          </div>
          <div className="p-5 md:p-7">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">需要先咨询线路或计费方式？</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  可以联系工作人员确认中国到美国线路、入库、合箱和美国段交接安排。费用和时效以实际打包记录、线路安排和工作人员确认为准。
                </p>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {siteConfig.publicContacts.note}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {contacts.map((contact) => (
                  <div key={contact.label} className="rounded-lg border bg-background p-4">
                    <p className="text-sm font-semibold">{contact.label}：{contact.name}</p>
                    <a
                      href={contact.phoneHref}
                      className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4 shrink-0" />
                      {contact.phone}
                    </a>
                    <p className="mt-1 break-all text-sm text-muted-foreground">微信：{contact.wechat}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={siteConfig.publicContacts.domestic.phoneHref}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Phone className="mr-2 h-4 w-4" />
                联系国内联系人
              </a>
              <a
                href={siteConfig.publicContacts.us.phoneHref}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Phone className="mr-2 h-4 w-4" />
                联系美国联系人
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                查看联系方式
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
