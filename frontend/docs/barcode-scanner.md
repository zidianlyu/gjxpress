# Barcode Scanner — 国内快递单号扫码录入

> Created: 2026-05-05

## 目标

在 Admin Portal 的"新增入库包裹"表单中，为"国内快递单号"输入框提供手机摄像头扫码能力，帮助管理员快速录入快递面单条码。

## 技术方案

### 组件

- **`src/components/admin/TrackingBarcodeScanner.tsx`** — Client Component
- **`src/lib/tracking-number.ts`** — 候选过滤工具函数

### 扫码库

- 主方案：`@zxing/browser` + `@zxing/library`
- 支持格式：CODE_128, CODE_39, EAN_13, EAN_8, UPC_A, UPC_E, ITF（BrowserMultiFormatReader 默认支持）
- 未使用原生 `BarcodeDetector`（兼容性不足）

### Client Component 原因

- 需要访问 `navigator.mediaDevices.getUserMedia`
- 需要操作 `<video>` 和 `<canvas>` 元素
- ZXing 库依赖浏览器 API
- 文件顶部声明 `'use client'`

## 状态机

```
idle → requesting → scanning → detected → (confirm/cancel) → idle
                  → error → (cancel) → idle
```

- **idle**: 未打开
- **requesting**: 请求摄像头权限中
- **scanning**: 摄像头已开，正在持续识别
- **detected**: 识别到有效候选运单号
- **error**: 权限失败或浏览器不支持

## getUserMedia 使用

```ts
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: false,
})
```

- 优先后置摄像头
- 桌面无后置摄像头时自动 fallback 到默认摄像头
- video 设置 `autoPlay`, `playsInline`, `muted`

## ROI (Region of Interest)

当前 v1 实现：

- 视频画面全屏显示
- **绿色半透明长条形识别框**覆盖在视频中央（85% 宽, 25% 高）
- 实际解码时从 video 帧裁剪对应 ROI 区域到 canvas
- 只对裁剪后的图像进行条码识别
- 减少识别到画面边缘其他条码/二维码的概率

## 候选过滤规则

工具函数位于 `src/lib/tracking-number.ts`：

### `normalizeTrackingCandidate(raw: string): string`

- trim 两端空格
- 移除内部空格

### `isLikelyDomesticTrackingNumber(value: string): boolean`

接受：
- 纯数字，长度 10–20 位
- 字母数字组合（含连字符），长度 10–32 位

拒绝：
- 长度 < 10 的值（如订单号 `3295261`）

### 为什么不自动填入

快递面单上可能有多个条码（运单号、订单号、包裹序号等），自动填入容易误填。通过：
1. 候选过滤（长度、格式）
2. 绿色框 ROI 裁剪
3. **人工确认**（必须点击"确认填入"）

三重保障避免误填。

## 摄像头 Stream Cleanup

以下场景都会停止摄像头：

1. 点击"取消"
2. 点击"确认填入"
3. 按 ESC
4. 组件 unmount

停止逻辑：
```ts
stream.getTracks().forEach(track => track.stop());
video.srcObject = null;
clearInterval(scanInterval);
```

## 移动端兼容

| 平台 | 说明 |
|------|------|
| iPhone Safari | `playsInline` 确保内联播放 |
| Android Chrome | 优先后置摄像头 |
| 微信内置浏览器 | 权限受限时显示错误，允许手动输入 |
| Desktop Chrome | 使用默认摄像头 |

## HTTPS / localhost 限制

- 摄像头 API 仅在 HTTPS 或 localhost 下可用
- 非安全环境打开时立即提示："摄像头功能需要 HTTPS 或 localhost 环境。"
- 不影响手动输入

## 识别频率

- 每 350ms 从视频帧解码一次
- 同一结果 300ms 内不重复更新 state
- 避免手机过热和不必要的 re-render

## 已知限制

- v1 绿色框 ROI 通过 canvas 裁剪实现，不是 ZXing 原生 ROI
- 某些低对比度或模糊条码可能需要调整距离和光线
- 微信内置浏览器可能在部分 Android 设备上不支持摄像头

## 后续优化方向（不在当前版本）

- 多设备切换（前/后摄像头切换按钮）
- 按快递公司维护更细单号规则
- OCR fallback（用于手写或模糊条码）
- 扫码历史记录
- 批量连续扫码模式
