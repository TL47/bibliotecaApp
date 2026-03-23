import type { CapacitorConfig } from '@capacitor/cli';


const config: CapacitorConfig = {
  appId: 'com.tl47.biblioteca',
  appName: 'BiblioTech',
  webDir: 'www',
  server: {
    startPath: '/assets/libros/index.html'
  }
};

export default config;
