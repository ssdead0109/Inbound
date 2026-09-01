import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kcp.smartrack',
  appName: 'KCP 자재관리(WMA)',
  webDir: 'dist',
  server: {
    url: 'http://192.168.2.29:3005',
    cleartext: true
  }
};

export default config;
