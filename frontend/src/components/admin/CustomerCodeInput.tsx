'use client';

import { useMemo } from 'react';

type CustomerCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
};

export function getCustomerCodeDigits(value: string): string {
  return value.toUpperCase().replace(/^GJ/, '').replace(/\D/g, '').slice(0, 4);
}

export function isCustomerCodeComplete(value: string): boolean {
  return /^\d{4}$/.test(getCustomerCodeDigits(value));
}

export function normalizeCustomerCodeInput(value: string): string {
  const digits = getCustomerCodeDigits(value);
  return digits ? `GJ${digits}` : '';
}

export function CustomerCodeInput({
  value,
  onChange,
  id,
  name,
  label = '客户编号',
  required = false,
  disabled = false,
  className = '',
  helperText = '只需输入 4 位数字，例如 3178',
}: CustomerCodeInputProps) {
  const digits = useMemo(() => getCustomerCodeDigits(value), [value]);
  const hasPartialError = digits.length > 0 && digits.length < 4;
  const requiredError = required && digits.length === 0;
  const error = hasPartialError
    ? '客户编号必须是 4 位数字'
    : requiredError
      ? '客户编号不能为空'
      : '';

  const handleChange = (next: string) => {
    const normalized = normalizeCustomerCodeInput(next);
    onChange(normalized);
  };

  return (
    <div className={className}>
      <label htmlFor={id || name} className="block text-xs font-medium mb-1">
        {label}{required ? ' *' : ''}
      </label>
      <div className="flex">
        <span className="inline-flex items-center rounded-l-md border border-r-0 bg-gray-100 px-3 text-sm font-semibold text-gray-700">
          GJ
        </span>
        <input
          id={id || name}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={digits}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            handleChange(e.clipboardData.getData('text'));
          }}
          maxLength={4}
          placeholder="3178"
          disabled={disabled}
          aria-invalid={!!error}
          className="w-full rounded-r-md border bg-background px-3 py-2 text-sm tabular-nums tracking-widest outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      </div>
      <p className={error ? 'mt-1 text-xs text-red-600' : 'mt-1 text-xs text-muted-foreground'}>
        {error || helperText}
      </p>
    </div>
  );
}
