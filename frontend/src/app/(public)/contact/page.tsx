import type { Metadata } from 'next';
import { MessageCircle, Clock, MapPin, Mail, Phone } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: '联系我们',
  description: `联系${SITE_CONFIG.brandDisplayName}获取中美跨境物流服务咨询，我们提供专业的供应链与物流信息服务支持。`,
};

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight">联系我们</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              有任何问题或需要咨询？欢迎联系我们
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* WeChat */}
              <div className="p-8 rounded-lg border bg-card">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">微信客服</h3>
                    <p className="text-sm text-muted-foreground">推荐方式</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  扫描二维码添加客服微信，获取一对一服务支持。
                </p>
                <div className="bg-muted rounded-lg p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">微信二维码</span>
                    </div>
                    <p className="text-sm text-muted-foreground">扫描二维码添加微信</p>
                  </div>
                </div>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                <div className="p-6 rounded-lg border bg-card">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">服务时间</h3>
                      <p className="text-sm text-muted-foreground">
                        周一至周六：9:00 - 18:00（太平洋时间）<br />
                        周日及节假日：休息
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg border bg-card">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">服务区域</h3>
                      <p className="text-sm text-muted-foreground">
                        美国本地华人社区<br />
                        主要覆盖：洛杉矶、旧金山、纽约等地区
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg border bg-card">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">电子邮箱</h3>
                      <p className="text-sm text-muted-foreground">
                        contact@gjxpress.net<br />
                        我们会在24小时内回复您的邮件
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg border bg-card">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">联系电话</h3>
                      <p className="text-sm text-muted-foreground">
                        微信客服：扫码添加<br />
                        服务时间：周一至周六 9:00-18:00 PT
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight mb-4">温馨提示</h2>
            <div className="text-muted-foreground space-y-2 text-sm">
              <p>
                1. 为了更好的服务体验，建议添加客服微信进行咨询
              </p>
              <p>
                2. 包裹追踪和订单管理请使用微信小程序操作
              </p>
              <p>
                3. 非工作时间留言，我们会在下一个工作日回复
              </p>
              <p>
                4. 紧急情况请直接联系客服微信
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
