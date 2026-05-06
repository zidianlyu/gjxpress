export type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

export type FaqCategory = {
  name: string;
  description: string;
  items: FaqItem[];
};

export const faqData: FaqItem[] = [
  // 服务流程
  {
    question: '广骏国际快运主要提供什么服务？',
    answer: '我们提供中国到美国方向的跨境物流信息与转运协助服务，包括国内仓入库记录、包裹拍照、合箱整理、集运出库、物流状态记录和美国段取货状态管理。',
    category: '服务流程',
  },
  {
    question: '我如何开始使用服务？',
    answer: '可以先在网站提交新客户注册信息。提交后系统会生成客户编号，工作人员审核通过后，该编号可用于后续包裹归属。',
    category: '服务流程',
  },
  {
    question: '客户编号有什么用？',
    answer: '客户编号用于帮助国内仓识别包裹归属。它不是登录密码，也不代表付款凭证。',
    category: '服务流程',
  },
  {
    question: '可以从哪些中国电商平台下单？',
    answer: '客户可以在常见中国电商平台下单，并将包裹寄送到工作人员提供的国内仓信息。请在收货信息中正确填写客户编号，方便入库识别。',
    category: '服务流程',
  },

  // 费用与计费
  {
    question: '运费如何计算？',
    answer: '包裹打包后，会比较实际重量和体积重，取较大值作为计费重量。最终费用以实际打包记录、线路、品类和工作人员确认为准。',
    category: '费用与计费',
  },
  {
    question: '页面上的价格是最终价格吗？',
    answer: '页面价格为参考价或起步价。实际费用会受到重量、体积、品类、线路和当次服务安排影响。',
    category: '费用与计费',
  },
  {
    question: '什么是体积重？',
    answer: '体积重是根据包裹长、宽、高计算出的重量参考值。若体积重大于实际重量，通常会以体积重作为计费基础。',
    category: '费用与计费',
  },

  // 时效
  {
    question: '空运多久能到？',
    answer: '空运通常比海运更快，但实际时效受航班、承运商处理、查验、天气、节假日和其他因素影响。页面展示的时效仅供参考。',
    category: '时效',
  },
  {
    question: '海运适合什么包裹？',
    answer: '海运通常适合体积较大、重量较高、对时效要求不高的包裹。具体是否适合，需要根据品类和当次线路确认。',
    category: '时效',
  },
  {
    question: '可以接急单吗？',
    answer: '不建议对固定到达时间有强要求的急单使用跨境转运服务。国际运输存在不可控因素，时效仅作参考。',
    category: '时效',
  },

  // 品类与合规
  {
    question: '哪些品类需要提前确认？',
    answer: '带电产品、液体/膏体、化妆品、食品、药品或医疗相关物品、品牌商品、高价值商品、易碎品等，建议在出货前联系工作人员确认。',
    category: '品类与合规',
  },
  {
    question: '哪些物品暂不承接？',
    answer: '法律法规、监管部门、承运商或服务商禁止或限制运输的物品暂不承接，包括危险品、易燃易爆物、活体动物、新鲜果蔬、酒类、烟草、需要冷藏保存的物品及其他违法违禁物品。',
    category: '品类与合规',
  },

  // 入库与图片
  {
    question: '包裹到国内仓后会发生什么？',
    answer: '工作人员会根据国内快递单号和客户编号进行入库识别，并根据需要记录包裹图片和状态。',
    category: '入库与图片',
  },
  {
    question: '为什么要拍包裹图片？',
    answer: '图片用于辅助确认包裹状态、减少沟通误差，并在异常处理时作为参考记录。',
    category: '入库与图片',
  },
  {
    question: '如果我忘记填写客户编号怎么办？',
    answer: '包裹可能进入未识别状态。请尽快联系工作人员，并提供国内快递单号、下单信息或其他可核验资料。',
    category: '入库与图片',
  },

  // 美国段取货
  {
    question: '你们服务哪些区域？',
    answer: '我们目前服务 Santa Clara、San Jose、Milpitas、Fremont 及湾区周边客户。美国段到达后，可根据实际情况安排本地上门递送或预约交接，具体安排由工作人员确认。',
    category: '美国段取货',
  },
  {
    question: '包裹到达美国后可以本地派送吗？',
    answer: '如需美国本地派送，请联系工作人员确认是否支持、费用和安排。',
    category: '美国段取货',
  },

  // 异常处理
  {
    question: '包裹丢失或少件怎么办？',
    answer: '请尽快联系工作人员，并提供客户编号、集运单号、照片、开箱记录或其他可核验资料。工作人员会根据入库记录、出库照片、承运商状态和实际情况协助核查。',
    category: '异常处理',
  },
  {
    question: '收到包裹后多久内反馈异常比较合适？',
    answer: '建议收到包裹后一周内反馈异常，并尽量提供照片、视频或其他可核验信息。',
    category: '异常处理',
  },

  // 新客户注册
  {
    question: 'Public 新客户注册后是否代表账号已开通？',
    answer: '不是。Public 新客户注册只是提交资料并生成客户编号，工作人员审核通过后，该编号才用于后续包裹归属。',
    category: '新客户注册',
  },
  {
    question: '客户编号可以用来登录吗？',
    answer: '不可以。客户编号用于包裹归属识别，不是登录密码，也不是付款凭证。',
    category: '新客户注册',
  },
];

export const faqCategories: FaqCategory[] = [
  {
    name: '服务流程',
    description: '了解服务流程和客户编号使用',
    items: faqData.filter(item => item.category === '服务流程'),
  },
  {
    name: '费用与计费',
    description: '运费计算和价格说明',
    items: faqData.filter(item => item.category === '费用与计费'),
  },
  {
    name: '时效',
    description: '运输时效参考',
    items: faqData.filter(item => item.category === '时效'),
  },
  {
    name: '品类与合规',
    description: '物品品类限制和合规要求',
    items: faqData.filter(item => item.category === '品类与合规'),
  },
  {
    name: '入库与图片',
    description: '包裹入库和图片记录',
    items: faqData.filter(item => item.category === '入库与图片'),
  },
  {
    name: '美国段取货',
    description: '美国取货和本地派送',
    items: faqData.filter(item => item.category === '美国段取货'),
  },
  {
    name: '异常处理',
    description: '包裹异常处理流程',
    items: faqData.filter(item => item.category === '异常处理'),
  },
  {
    name: '新客户注册',
    description: '新客户注册和客户编号',
    items: faqData.filter(item => item.category === '新客户注册'),
  },
];

// 精选 FAQ for specific pages
export const servicesFaqs = faqData.filter(item => [
  '广骏国际快运主要提供什么服务？',
  '运费如何计算？',
  '页面上的价格是最终价格吗？',
  '空运多久能到？',
  '海运适合什么包裹？',
].includes(item.question));

export const registerFaqs = faqData.filter(item => [
  '我如何开始使用服务？',
  '客户编号有什么用？',
  'Public 新客户注册后是否代表账号已开通？',
  '客户编号可以用来登录吗？',
].includes(item.question));

export const complianceFaqs = faqData.filter(item => [
  '哪些品类需要提前确认？',
  '哪些物品暂不承接？',
].includes(item.question));

export const compensationFaqs = faqData.filter(item => [
  '包裹丢失或少件怎么办？',
  '收到包裹后多久内反馈异常比较合适？',
].includes(item.question));
