import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kcp.smartrack',
  appName: 'KCP SmartRack',
  webDir: 'dist',
  server: {
    url: 'https://inbound-ieni.onrender.com',
    cleartext: true
  }
};

export default config;
