// DevVit entry point with Express server integration
import { Devvit, SettingScope } from '@devvit/public-api';

// configure DevVit capabilities - no HTTP needed for Redis-only setup
Devvit.configure({ 
  redditAPI: true,
  redis: true
});

// define app settings for Supabase environment variables
Devvit.addSettings([
  {
    type: 'string',
    name: 'SUPABASE_URL',
    label: 'Supabase Project URL',
    scope: SettingScope.App
  },
  {
    type: 'string',
    name: 'SUPABASE_SERVICE_ROLE',
    label: 'Supabase Service Role Key',
    scope: SettingScope.App
  },
  {
    type: 'string',
    name: 'SUPABASE_ANON_KEY',
    label: 'Supabase Anonymous Key',
    scope: SettingScope.App
  }
]);

console.log('DevVit settings registered successfully');

// import and register Express server with DevVit's web server
import('./index.js').then((module) => {
  console.log('Express server imported and started');
}).catch((error) => {
  console.error('Failed to import Express server:', error);
});

export default Devvit;