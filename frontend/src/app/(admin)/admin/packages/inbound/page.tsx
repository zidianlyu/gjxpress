'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, Loader2, CheckCircle } from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';

export default function PackageInboundPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    userCode: '',
    domesticTrackingNo: '',
    sourcePlatform: '',
    actualWeight: '',
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    remark: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // For demonstration, simulate API call
      // In production: await adminApi.inboundPackage(formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);
    } catch {
      setError('入库失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      userCode: '',
      domesticTrackingNo: '',
      sourcePlatform: '',
      actualWeight: '',
      lengthCm: '',
      widthCm: '',
      heightCm: '',
      remark: '',
    });
    setIsSuccess(false);
    setError('');
  };

  if (isSuccess) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">入库成功</h2>
              <p className="text-muted-foreground mb-6">
                包裹已成功入库，用户可以在小程序中查看
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                >
                  继续入库
                </button>
                <Link
                  href="/admin/packages"
                  className="px-6 py-2 rounded-md border font-medium hover:bg-muted"
                >
                  查看包裹列表
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <Link
          href="/admin/packages"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回包裹列表
        </Link>
        <h1 className="text-2xl font-bold">包裹入库</h1>
        <p className="text-muted-foreground">录入新到包裹信息</p>
      </header>

      {/* Form */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Code */}
            <div>
              <label htmlFor="userCode" className="block text-sm font-medium mb-2">
                用户码 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="userCode"
                name="userCode"
                value={formData.userCode}
                onChange={handleChange}
                required
                placeholder="如：1023"
                className="w-full px-3 py-2 rounded-md border bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                用户在微信小程序中的四位数字ID
              </p>
            </div>

            {/* Domestic Tracking No */}
            <div>
              <label htmlFor="domesticTrackingNo" className="block text-sm font-medium mb-2">
                国内快递单号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="domesticTrackingNo"
                name="domesticTrackingNo"
                value={formData.domesticTrackingNo}
                onChange={handleChange}
                required
                placeholder="如：SF123456789"
                className="w-full px-3 py-2 rounded-md border bg-background"
              />
            </div>

            {/* Source Platform */}
            <div>
              <label htmlFor="sourcePlatform" className="block text-sm font-medium mb-2">
                来源平台 <span className="text-red-500">*</span>
              </label>
              <select
                id="sourcePlatform"
                name="sourcePlatform"
                value={formData.sourcePlatform}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md border bg-background"
              >
                <option value="">请选择</option>
                <option value="淘宝">淘宝</option>
                <option value="天猫">天猫</option>
                <option value="京东">京东</option>
                <option value="拼多多">拼多多</option>
                <option value="抖音">抖音</option>
                <option value="其他">其他</option>
              </select>
            </div>

            {/* Weight and Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="actualWeight" className="block text-sm font-medium mb-2">
                  实际重量 (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="actualWeight"
                  name="actualWeight"
                  value={formData.actualWeight}
                  onChange={handleChange}
                  required
                  step="0.01"
                  placeholder="如：2.5"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="lengthCm" className="block text-sm font-medium mb-2">
                  长 (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="lengthCm"
                  name="lengthCm"
                  value={formData.lengthCm}
                  onChange={handleChange}
                  required
                  placeholder="cm"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
              <div>
                <label htmlFor="widthCm" className="block text-sm font-medium mb-2">
                  宽 (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="widthCm"
                  name="widthCm"
                  value={formData.widthCm}
                  onChange={handleChange}
                  required
                  placeholder="cm"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
              <div>
                <label htmlFor="heightCm" className="block text-sm font-medium mb-2">
                  高 (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="heightCm"
                  name="heightCm"
                  value={formData.heightCm}
                  onChange={handleChange}
                  required
                  placeholder="cm"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
            </div>

            {/* Remark */}
            <div>
              <label htmlFor="remark" className="block text-sm font-medium mb-2">
                备注
              </label>
              <textarea
                id="remark"
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                rows={3}
                placeholder="可选：包裹外观、特殊说明等"
                className="w-full px-3 py-2 rounded-md border bg-background"
              />
            </div>

            {/* Photo Upload Hint */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">拍照提示</p>
                  <p className="text-sm text-blue-700 mt-1">
                    请在入库后拍摄以下照片：外包装照片、面单照片、内部物品照片。
                    照片上传功能在后续版本中提供。
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  '确认入库'
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-md border font-medium hover:bg-muted"
              >
                重置
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
