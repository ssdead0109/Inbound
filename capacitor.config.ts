import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kcp.smartrack',
  appName: 'KCP 자재관리',
  webDir: 'dist',
  server: {
    url: 'http://192.168.2.29:3000',
    cleartext: true
  }
};

export default config;
