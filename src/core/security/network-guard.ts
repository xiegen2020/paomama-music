class NetworkGuard {
  private installed = false;

  install(): void {
    if (this.installed) return;
    this.installed = true;

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      // 仅允许同源请求和Service Worker缓存请求
      if (url.startsWith('/') || url.startsWith(location.origin) || url.startsWith('blob:')) {
        return originalFetch.apply(this, args);
      }
      // 开发模式下输出警告
      if (import.meta.env.DEV) {
        console.warn(`[NetworkGuard] 拦截外发请求: ${url}`);
      }
      return new Response('', { status: 403, statusText: 'Blocked by NetworkGuard' });
    };
  }

  getContentSecurityPolicy(): string {
    return [
      "default-src 'self'",
      "script-src 'self'",
      "worker-src 'self' blob:",
      "connect-src 'self'",
      "media-src 'self' blob:",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
    ].join('; ');
  }
}

export const networkGuard = new NetworkGuard();
