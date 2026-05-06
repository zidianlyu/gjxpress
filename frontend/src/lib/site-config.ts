export const siteConfig = {
  name: '广骏国际快运',
  legalName: '广骏供应链服务',
  englishName: 'GJXpress',
  slogan: '看得见的跨境物流',
  domain: 'gjxpress.net',
  url: 'https://gjxpress.net',
  description:
    '广骏供应链服务提供中国到美国方向的跨境物流信息与转运协助服务，支持入库记录、包裹拍照、合箱整理、物流状态查询与美国段本地递送安排。',
  locale: 'zh_CN',
  serviceAreas: [
    'Santa Clara',
    'San Jose',
    'Milpitas',
    'Fremont',
    'Sunnyvale',
    'Cupertino',
    'Bay Area'
  ],
  publicLocationSummary: '服务 Santa Clara、San Jose、Milpitas、Fremont 及湾区周边客户。',
  handoffSummary: '支持本地上门递送或预约交接，具体安排由工作人员确认。',
} as const;

export type SiteConfig = typeof siteConfig;
