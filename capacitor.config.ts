import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kcp.smartrack',
  appName: 'KCP SmartRack',
  webDir: 'dist',
  server: {
    url: 'http://192.168.2.29:3002',
    cleartext: true
  }
};

export default config;
