import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kcp.inbound',
  appName: 'KCP 자재',
  webDir: 'dist',
  server: {
    url: 'https://inbound-ieni.onrender.com',
    cleartext: true,
  },
};

export default config;
