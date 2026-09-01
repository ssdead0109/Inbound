import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kcp.smartrack',
  appName: 'KCP SmartRack',
  webDir: 'dist',
  server: {
    url: 'https://192.168.2.29:3005',
    cleartext: true
  }
};

export default config;
