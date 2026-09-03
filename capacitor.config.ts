import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kcp.smartrack',
  appName: 'KCP 자재관리',
  webDir: 'dist',
  server: {
    url: 'https://inbound-ieni.onrender.com',
    cleartext: true,
  },
};

export default config;
