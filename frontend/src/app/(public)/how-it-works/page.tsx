import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, ShoppingCart, Package, Camera, Smartphone, Plane, CheckCircle, MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: '使用流程',
  description: `了解如何使用${SITE_CONFIG.brandDisplayName}的服务：复制国内仓地址、电商平台下单、包裹入库确认、国际发货与物流查询。`,
};

const steps = [
  {
    number: '01',
    icon: MapPin,
    title: '复制国内仓地址',
    description: '进入微信小程序，获取您的专属国内仓收货地址。地址中包含您的用户识别码，方便仓库识别您的包裹。',
    details: [
      '打开微信小程序"广骏供应链服务"',
      '完成微信登录',
      '在"地址"页面获取您的专属仓库地址',
      '复制完整地址信息',
    ],
  },
  {
    number: '02',
    icon: ShoppingCart,
    title: '在电商平台下单',
    description: '在淘宝、京东等电商平台购物时，将收货地址填写为您的专属国内仓地址。记得在备注中保留您的用户ID。',
    details: [
      '在淘宝、京东等平台选购商品',
      '填写收货地址为您的国内仓地址',
      '收件人格式：广骏仓-XXXX（您的用户码）',
      '完成下单并等待商品发货',
    ],
  },
  {
    number: '03',
    icon: Package,
    title: '包裹到达国内仓',
    description: '您的包裹到达国内仓库后，我们的工作人员会进行入库登记，系统会自动关联到您的账户。',
    details: [
      '包裹到达国内仓',
      '仓库扫描识别您的用户码',
      '系统自动关联到您的账户',
      '您可以收到入库通知',
    ],
  },
  {
    number: '04',
    icon: Camera,
    title: '仓库拍照、称重、入库',
    description: '仓库工作人员会拍摄包裹的外包装、面单和内部物品照片，并记录包裹的重量和尺寸信息。',
    details: [
      '拍摄外包装照片',
      '拍摄快递面单照片',
      '开箱拍摄内部物品照片',
      '记录实际重量和长宽高',
      '计算体积重量和计费重量',
    ],
  },
  {
    number: '05',
    icon: Smartphone,
    title: '用户在微信小程序确认',
    description: '您可以在微信小程序中查看包裹照片、重量和尺寸信息，确认无误后点击确认，或提交异常反馈。',
    details: [
      '打开微信小程序查看包裹详情',
      '查看入库照片',
      '核对重量和尺寸信息',
      '确认无误或提交异常',
    ],
  },
  {
    number: '06',
    icon: Plane,
    title: '管理员安排发货',
    description: '所有包裹确认完成后，管理员会计算总费用，安排国际发货，并提供物流单号。',
    details: [
      '管理员计算总费用',
      '确认支付状态',
      '选择合适的运输方式',
      '生成物流单号',
      '安排国际运输',
    ],
  },
  {
    number: '07',
    icon: CheckCircle,
    title: '用户查看物流状态',
    description: '您可以在微信小程序中实时查看物流状态，包裹到达后扫码确认收货。',
    details: [
      '在小程序查看物流状态',
      '了解包裹运输进度',
      '包裹到达后扫码确认',
      '完成整个流程',
    ],
  },
];

const faqs = [
  {
    question: '如何获取我的专属仓库地址？',
    answer: '完成微信小程序的微信登录后，系统会自动为您生成四位用户码，您可以在"地址"页面查看完整的国内仓收货地址，地址中的收件人字段包含您的用户识别码。',
  },
  {
    question: '入库拍照能看到哪些内容？',
    answer: '我们会为每个包裹拍摄三类照片：外包装照片（查看包裹外观是否完好）、快递面单照片（确认快递单号和收件人信息）、内部物品照片（查看包裹内具体商品）。',
  },
  {
    question: '如何计算运费？',
    answer: '运费根据计费重量计算。计费重量 = max(实际重量, 体积重量)，其中体积重量 = 长(cm) × 宽(cm) × 高(cm) / 6000。空运和海运的单价不同，具体费用以系统计算为准。',
  },
  {
    question: '包裹有问题怎么办？',
    answer: '如果您在查看入库照片时发现包裹有问题（如破损、少件、错货等），可以在小程序中提交异常反馈，我们的客服人员会及时处理。',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Header */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight">使用流程</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              简单七步，轻松完成中美跨境物流
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                {/* Visual */}
                <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shrink-0">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <span className="text-4xl font-bold text-muted-foreground/30">{step.number}</span>
                      <h3 className="text-2xl font-bold mt-2">{step.title}</h3>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">常见问题</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question} className="p-6 rounded-lg border bg-card">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold tracking-tight">还有疑问？</h2>
            <p className="mt-4 text-muted-foreground">
              联系我们的客服，获取更多帮助
            </p>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                联系客服
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
