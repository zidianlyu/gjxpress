export const siteConfig = {
  name: '广骏国际快运',
  legalName: '广骏供应链服务',
  englishName: 'GJXpress',
  slogan: '看得见的跨境物流',
  domain: 'gjxpress.net',
  url: 'https://gjxpress.net',
  description:
    '广骏供应链服务提供中国到美国方向的跨境物流信息与转运协助服务，支持入库记录、包裹拍照、合箱整理、物流状态查询与美国段取货状态管理。',
  locale: 'zh_CN',
  address: {
    streetAddress: '2615 El Camino Real',
    addressLocality: 'Santa Clara',
    addressRegion: 'CA',
    postalCode: '95051',
    addressCountry: 'US',
  },
} as const;

export type SiteConfig = typeof siteConfig;
