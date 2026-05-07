'use client';

import { Check, Copy, Phone } from 'lucide-react';
import { useState } from 'react';
import { siteConfig } from '@/lib/site-config';

const contacts = [siteConfig.publicContacts.domestic, siteConfig.publicContacts.us];

export function PublicContactCards() {
  const [copiedWechat, setCopiedWechat] = useState('');

  const copyWechat = async (wechat: string) => {
    try {
      await navigator.clipboard.writeText(wechat);
      setCopiedWechat(wechat);
      window.setTimeout(() => setCopiedWechat(''), 1600);
    } catch {
      setCopiedWechat('');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {contacts.map((contact) => {
        const copied = copiedWechat === contact.wechat;

        return (
          <section key={contact.label} className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{contact.label}</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted-foreground">联系人：</dt>
                <dd className="min-w-0 break-words font-medium">{contact.name}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted-foreground">电话：</dt>
                <dd className="min-w-0">
                  <a
                    href={contact.phoneHref}
                    className="inline-flex items-center gap-2 break-words text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted-foreground">微信：</dt>
                <dd className="min-w-0">
                  <span className="break-all">{contact.wechat}</span>
                  <button
                    type="button"
                    onClick={() => copyWechat(contact.wechat)}
                    className="ml-3 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`复制${contact.label}微信号`}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                </dd>
              </div>
            </dl>
          </section>
        );
      })}
    </div>
  );
}
