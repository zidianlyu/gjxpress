type ApiItemWrapper<T> = {
  item?: T;
  data?: T;
};

export function unwrapApiItem<T>(response: T | ApiItemWrapper<T>): T;
export function unwrapApiItem<T>(response: unknown): T;
export function unwrapApiItem<T>(response: unknown): T {
  if (response && typeof response === 'object') {
    const wrapper = response as ApiItemWrapper<T>;
    if (wrapper.item != null) return wrapper.item;
    if (wrapper.data != null) return wrapper.data;
  }
  return response as T;
}

export function getEntityId(response: unknown): string | null {
  const item = unwrapApiItem<unknown>(response);
  if (!item || typeof item !== 'object') return null;
  const id = (item as Record<string, unknown>).id;
  return typeof id === 'string' && id ? id : null;
}

export function safeShortId(value?: string | null, fallback = '未编号'): string {
  return value ? value.slice(0, 8) : fallback;
}
