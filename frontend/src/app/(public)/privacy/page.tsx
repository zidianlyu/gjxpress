import type { Metadata } from 'next';
import { Lock, Eye, EyeOff, Shield, UserPlus, Share2 } from 'lucide-react';

export const metadata: Metadata = {
  title: '隐私政策｜广骏国际快运',
  description: '了解广骏国际快运如何处理联系方式、客户编号、包裹记录、图片、交易记录和注册申请信息。',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">隐私政策</h1>
          <p className="mt-2 text-muted-foreground">最后更新：2025年5月</p>
        </div>

        <div className="space-y-6">
          {/* 1. Information We Collect */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">我们收集的信息</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              我们在提供服务过程中可能收集以下信息：
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
              <li><strong>联系方式</strong>：区号、手机号、微信号 — 用于客户联系和服务沟通</li>
              <li><strong>客户编号</strong>：例如 GJ0427 — 用于包裹归属识别</li>
              <li><strong>国内退货地址</strong> — 用于特殊情况下协助处理退回需求</li>
              <li><strong>国内快递单号</strong> — 用于入库识别和状态查询</li>
              <li><strong>包裹图片</strong> — 用于入库确认、异常沟通和服务记录</li>
              <li><strong>集运单信息</strong>：集运单号、状态、重量、体积、计费记录</li>
              <li><strong>交易记录</strong>：运费、退款等后台记录</li>
              <li><strong>注册申请信息</strong>：通过 Public 注册页面主动提交的信息</li>
              <li><strong>设备和访问日志</strong>：如 requestId、基础浏览器信息 — 用于安全和排错</li>
            </ul>
          </div>

          {/* 2. How We Use Information */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">我们如何使用信息</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              收集的信息用于以下目的：
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
              <li>客户联系和身份确认</li>
              <li>包裹归属和入库/出库记录</li>
              <li>物流状态查询和更新</li>
              <li>异常处理和客服沟通</li>
              <li>费用记录和账目管理</li>
              <li>系统安全和问题排查</li>
            </ul>
          </div>

          {/* 3. What Public Pages Do NOT Show */}
          <div className="p-6 rounded-lg border border-blue-200 bg-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <EyeOff className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-blue-900">Public 页面不会展示的信息</h2>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed mb-3">
              为保护客户隐私，Public 页面（无需登录即可访问的页面）不会展示以下信息：
            </p>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1.5">
              <li>手机号</li>
              <li>微信号</li>
              <li>国内退货地址</li>
              <li>客户姓名或个人身份资料</li>
              <li>包裹图片</li>
              <li>交易记录</li>
              <li>管理员备注</li>
              <li>其他客户资料</li>
            </ul>
          </div>

          {/* 4. Customer Registration */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">新客户注册说明</h2>
            </div>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
              <li>Public 注册页面用于提交联系信息和生成客户编号</li>
              <li>提交注册不代表正式客户已开通，需经工作人员审核</li>
              <li>客户编号用于包裹归属识别，不是登录密码</li>
              <li>当前阶段不提供 User Portal 登录功能</li>
              <li>注册信息仅用于服务沟通和包裹处理</li>
            </ul>
          </div>

          {/* 5. Data Security */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">数据安全</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              我们采取合理的技术和组织措施保护您的信息：
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
              <li>前端网页不直接访问数据库，所有数据通过后端服务处理</li>
              <li>图片和客户资料通过后端 API 管理，不在前端暴露</li>
              <li>管理员页面需要登录认证，未授权不可访问</li>
              <li>Public 页面不公开展示敏感资料</li>
              <li>数据传输使用 HTTPS 加密</li>
            </ul>
          </div>

          {/* 6. Information Sharing */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">信息共享</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              我们不会将您的个人信息出售给第三方。仅在以下情况下可能共享必要信息：
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
              <li>与承运物流供应商共享必要的包裹信息以完成运输</li>
              <li>法律要求或政府机关依法要求提供</li>
            </ul>
          </div>

          {/* 7. Contact */}
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">联系我们</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              如对隐私政策有疑问，请联系工作人员。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
