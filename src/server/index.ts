import express, { Request } from 'express';
import { InitResponse, IncrementResponse, DecrementResponse } from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';

const app = express();

// middleware for JSON body parsing
app.use(express.json({ limit: '8mb' }));
// middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true, limit: '8mb' }));
// middleware for plain text body parsing
app.use(express.text({ limit: '8mb', type: 'text/plain' }));

// // configure multer for file uploads (store in memory)
// const upload = multer({ 
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PNG and JPEG files are allowed'));
//     }
//   }
// });

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

app.get('/api/stats', async (req, res) => {
  const userId = context.userId; // get userID
  if (!userId) {
    res.status(400).json({
      status: 'error',
      message: 'userId is missing',
    });
    return;
  }
  const stats = await redis.get(`stats:${userId}`); // get existing stats
  let parsedStats;

  if (stats) {
    parsedStats = JSON.parse(stats);
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    parsedStats = { wins: 0, plays: 0, win5: 0, win4: 0, win3: 0, win2: 0, win1: 0, streak: 0, maxStreak: 0, lastPlayed: yesterday, hearts: 5 };
    console.log("stats: e ", parsedStats);
    await redis.set(`stats:${userId}`, JSON.stringify(parsedStats)); // save back to redis
  }
  res.json({ status: 'success', stats: parsedStats, message: 'Stats retrieved' });
});

// win endpoint
app.post('/api/win', async (_req, res) => {
  const userId = context.userId; // get userID
  if (!userId) {
    res.status(400).json({
      status: 'error',
      message: 'userId is missing',
    });
    return;
  }
  const stats = await redis.get(`stats:${userId}`); // get existing stats
  let parsedStats;

  if (stats) {
    parsedStats = JSON.parse(stats);
    parsedStats.wins = (parsedStats.wins || 0) + 1; // increment plays by 1
  } else {
    res.status(400).json({
      status: 'error',
      message: 'user stats not found, please call /api/play first',
    });
  }
  await redis.set(`stats:${userId}`, JSON.stringify(parsedStats)); // save back to redis

  res.json({ status: 'success', stats: parsedStats, message: 'Stats updated' });
});

// play endpoint
app.post('/api/play', async (_req, res) => {
  const userId = context.userId; // get userID
  if (!userId) {
    res.status(400).json({
      status: 'error',
      message: 'userId is missing',
    });
    return;
  }
  const date = new Date().toISOString().split('T')[0]; // get current date in YYYY-MM-DD format
  const stats = await redis.get(`stats:${userId}`); // get existing stats
  let parsedStats;

  if (stats) {
    parsedStats = JSON.parse(stats);
    parsedStats.plays = (parsedStats.plays || 0) + 1; // increment plays by 1
  } else {
    parsedStats = { wins: 0, plays: 1, win5: 0, win4: 0, win3: 0, win2: 0, win1: 0, streak: 0, maxStreak: 0, lastPlayed: date, hearts: 5 };
  }
  await redis.set(`stats:${userId}`, JSON.stringify(parsedStats)); // save back to redis

  res.json({ status: 'success', stats: parsedStats, message: 'Stats updated' });
});

// win5 endpoint
app.post('/api/win5', async (req, res) => {
  const userId = context.userId; // get userID
  if (!userId) {
    res.status(400).json({
      status: 'error',
      message: 'userId is missing',
    });
    return;
  }
  const stats = await redis.get(`stats:${userId}`); // get existing stats
  let parsedStats;

  if (stats) {
    parsedStats = JSON.parse(stats);
    parsedStats.win5 = (parsedStats.win5 || 0) + 1; // increment plays by 1
  } else {
    res.status(400).json({
      status: 'error',
      message: 'user stats not found, please call /api/play first',
    });
  }
  await redis.set(`stats:${userId}`, JSON.stringify(parsedStats)); // save back to redis

  res.json({ status: 'success', stats: parsedStats, message: 'Stats updated' });
});

// win4 endpoint
app.post('/api/win4', async (req, res) => {
  const userId = context.userId; // get userID
  if (!userId) {
    res.status(400).json({
      status: 'error',
      message: 'userId is missing',
    });
    return;
  }
  const stats = await redis.get(`stats:${userId}`); // get existing stats
  let parsedStats;

  if (stats) {
    parsedStats = JSON.parse(stats);
    parsedStats.win4 = (parsedStats.win4 || 0) + 1; // increment plays by 1
  } else {
    res.status(400).json({
      status: 'error',
      message: 'user stats not found, please call /api/play first',
    });
  }
  await redis.set(`stats:${userId}`, JSON.stringify(parsedStats)); // save back to redis

  res.json({ status: 'success', stats: parsedStats, message: 'Stats updated' });
});

// win3 endpoint
app.post('/api/win3', async (req, res) => {
  const userId = context.userId; // get userID
  if (!userId) {
    res.status(400).json({
      status: 'error',
      message: 'userId is missing',
    });
    return;
  }
  const stats = await redis.get(`stats:${userId}`); // get existing stats
  let parsedStats;

  if (stats) {
    parsedStats = JSON.parse(stats);
    parsedStats.win3 = (parsedStats.win3 || 0) + 1; // increment plays by 1
  } else {
    res.status(400).json({
      status: 'error',
      message: 'user stats not found, please call /api/play first',
    });
  }
  await redis.set(`stats:${userId}`, JSON.stringify(parsedStats)); // save back to redis

  res.json({ status: 'success', stats: parsedStats, message: 'Stats updated' });
});

// win2 endpoint
app.post('/api/win2', async (req, res) => {
  const userId = context.userId; // get userID
  if (!userId) {
    res.status(400).json({
      status: 'error',
      message: 'userId is missing',
    });
    return;
  }
  const stats = await redis.get(`stats:${userId}`); // get existing stats
  let parsedStats;

  if (stats) {
    parsedStats = JSON.parse(stats);
    parsedStats.win2 = (parsedStats.win2 || 0) + 1; // increment plays by 1
  } else {
    res.status(400).json({
      status: 'error',
      message: 'user stats not found, please call /api/play first',
    });
  }
  await redis.set(`stats:${userId}`, JSON.stringify(parsedStats)); // save back to redis

  res.json({ status: 'success', stats: parsedStats, message: 'Play recorded' });
});

// win1 endpoint
app.post('/api/win1', async (req, res) => {
  const userId = context.userId; // get userID
  if (!userId) {
    res.status(400).json({
      status: 'error',
      message: 'userId is missing',
    });
    return;
  }
  const stats = await redis.get(`stats:${userId}`); // get existing stats
  let parsedStats;

  if (stats) {
    parsedStats = JSON.parse(stats);
    parsedStats.win1 = (parsedStats.win1 || 0) + 1; // increment plays by 1
  } else {
    res.status(400).json({
      status: 'error',
      message: 'user stats not found, please call /api/play first',
    });
  }
  await redis.set(`stats:${userId}`, JSON.stringify(parsedStats)); // save back to redis

  res.json({ status: 'success', stats: parsedStats, message: 'Stats updated' });
});

// streak endpoint
app.post('/api/streak', async (req, res) => {
  const userId = context.userId; // get userID
  if (!userId) {
    res.status(400).json({
      status: 'error',
      message: 'userId is missing',
    });
    return;
  }
  const stats = await redis.get(`stats:${userId}`); // get existing stats
  let parsedStats;

  if (stats) {
    parsedStats = JSON.parse(stats);
    const lastDate = new Date(parsedStats.lastPlayed);
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // if last played was yesterday, increment streak
      parsedStats.streak = (parsedStats.streak || 0) + 1;
    } else if (diffDays > 1) {
      // if last played was more than a day ago, reset streak
      parsedStats.streak = 1;
    } else {
      // if last played is not today (shouldn't happen), reset streak
      parsedStats.streak = 1;
    }
    parsedStats.lastPlayed = currentDate.toISOString().split('T')[0]; // update last played date
  } else {
    res.status(400).json({
      status: 'error',
      message: 'user stats not found, please call /api/play first',
    });
  }
  await redis.set(`stats:${userId}`, JSON.stringify(parsedStats)); // save back to redis

  res.json({ status: 'success', stats: parsedStats, message: 'Play recorded' });
});

// maxStreak endpoint
app.post('/api/maxStreak', async (req, res) => {
  const userId = context.userId; // get userID
  if (!userId) {
    res.status(400).json({
      status: 'error',
      message: 'userId is missing',
    });
    return;
  }
  const stats = await redis.get(`stats:${userId}`); // get existing stats
  let parsedStats;

  if (stats) {
    parsedStats = JSON.parse(stats);

    // if current streak is greater than maxStreak, update maxStreak
    if (parsedStats.streak > (parsedStats.maxStreak || 0)) { 
      parsedStats.maxStreak = parsedStats.streak;
    }
  } else {
    res.status(400).json({
      status: 'error',
      message: 'user stats not found, please call /api/play first',
    });
  }
  await redis.set(`stats:${userId}`, JSON.stringify(parsedStats)); // save back to redis

  res.json({ status: 'success', stats: parsedStats, message: 'Stats updated' });
});


// hearts endpoint
app.post('/api/hearts', async (req, res) => {
  const userId = context.userId; // get userID
  if (!userId) {
    res.status(400).json({
      status: 'error',
      message: 'userId is missing',
    });
    return;
  }
  const { hearts } = req.body;
  if (typeof hearts !== 'number' || hearts < 0 || hearts > 5) {
    res.status(400).json({
      status: 'error',
      message: 'hearts must be a number between 0 and 5',
    });
    return;
  }
  const stats = await redis.get(`stats:${userId}`); // get existing stats
  let parsedStats;

  if (stats) {
    parsedStats = JSON.parse(stats);

    parsedStats.hearts = hearts; // set hearts to the provided value
  } else {
    res.status(400).json({
      status: 'error',
      message: 'user stats not found, please call /api/play first',
    });
  }
  await redis.set(`stats:${userId}`, JSON.stringify(parsedStats)); // save back to redis

  res.json({ status: 'success', stats: parsedStats, message: 'Stats updated' });
});

// DevVit configuration in devvit-config.ts

import { gradeAnswer } from './lib/grading';
import type { GuessRequest } from '../shared/types/api.ts';

// UTC yyyy-mm-dd
function todayUTC(date = new Date()): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}


// COMMENTED OUT: Old Supabase-based daily seeding endpoint - replaced with Redis
/*
// daily seeding endpoint (to be called by external cron or manually)
router.get('/internal/jobs/seed-daily-challenge', async (_req, res): Promise<void> => {
    const dateStr = todayUTC();

    const supabase = await getSupabaseService();
    const { data: existing, error: selErr } = await supabase
      .from('challenges')
      .select('challenge_date')
      .eq('challenge_date', dateStr)
      .maybeSingle();

    if (selErr) {
      res.status(500).json({ error: `DB select error: ${selErr.message}` });
      return;
    }
    if (existing) {
      res.status(200).json({ status: 'OK', message: 'Already seeded' });
      return;
    }

    const { label, aliases } = labelOfTheDay();

    let items = await searchOpenverse(label, 50);
    items = items.filter(i => (i.width ?? 0) >= 512 && (i.height ?? 0) >= 512);

    if (!items.length) {
      res.status(404).json({ error: 'No Openverse results' });
      return;
    }

    const epochDays = Math.floor(Date.now() / 86400000);
    const pick = pickDeterministic(items, epochDays);

    const { error: upErr } = await supabase.from('challenges').upsert({
      challenge_date: dateStr,
      openverse_id: pick.id,
      image_url: pick.url,
      thumb_url: pick.thumbnail ?? null,
      title: pick.title ?? null,
      tags: pick.tags ?? [],
      license_slug: pick.license ?? null,
      license_version: pick.license_version ?? null,
      provider: pick.provider ?? null,
      source_url: pick.foreign_landing_url ?? null,
      attribution: pick.attribution ?? null,
      mature: !!pick.mature,
      width: pick.width ?? null,
      height: pick.height ?? null,
      label,
      aliases
    }, { onConflict: 'challenge_date' });

    if (upErr) {
      res.status(500).json({ error: `DB upsert error: ${upErr.message}` });
      return;
    }
    res.status(200).json({ status: 'OK', message: 'Daily challenge seeded successfully' });
  });
*/

// NEW: Redis-based image storage endpoints

// // store an image in Redis (accepts PNG/JPEG file upload)
// router.post('/api/store-image', upload.single('image'), async (req: Request, res): Promise<void> => {
//   try {
//     const { id, label, aliases, width, height } = req.body;
//     const file = (req as any).file;
    
//     if (!id || !label || !file) {
//       res.status(400).json({ error: 'Missing required fields: id, label, and image file' });
//       return;
//     }

//     // convert buffer to base64
//     const imageBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

//     const imageData: ImageData = {
//       id,
//       label: label.toLowerCase(),
//       aliases: aliases ? JSON.parse(aliases) : [], // parse aliases if provided as JSON string
//       imageBase64,
//       width: width ? parseInt(width) : file.size, // use provided width or file size as fallback
//       height: height ? parseInt(height) : file.size,
//       dateAdded: new Date().toISOString()
//     };

//     await storeImageInRedis(imageData);
//     console.log(`Stored image ${id} for label "${label}" (${file.originalname}, ${file.size} bytes)`);
    
//     res.json({ 
//       status: 'success', 
//       message: `Image stored for label "${label}"`, 
//       id,
//       filename: file.originalname,
//       size: file.size,
//       mimetype: file.mimetype
//     });
//   } catch (error: any) {
//     console.error('Store image error:', error);
//     res.status(500).json({ error: `Failed to store image: ${error.message}` });
//   }
// });


// use the robust daily.ts system for daily image selection
router.get('/api/daily', async (_req, res): Promise<void> => {
  try {
    const { dateUTC, image } = await getDailyImage();
    res.json({ 
      status: 'success', 
      dateUTC, 
      image: {
        id: image.id,
        name: image.name,
        imageUrl: image.imageUrl,
        thumbUrl: image.thumbUrl,
        width: image.width,
        height: image.height
      }
    });
  } catch (error: any) {
    console.error('Daily image error:', error);
    const msg = error?.message ?? 'Internal error';
    const code = msg.includes('No images seeded') ? 404 : 500;
    res.status(code).json({ error: msg });
  }
});


// guess grading endpoint - works with daily.ts system
router.post('/api/guess', async (req, res): Promise<void> => {
  try {
    const body = req.body as GuessRequest;
    const guess: string = body?.guess ?? '';

    // get today's daily image
    const { image } = await getDailyImage();
    
    // grade the guess against all labels
    const result = gradeAnswer(guess, image.labels[0] ?? '', image.labels);

    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: `Bad request: ${e?.message ?? 'unknown'}` });
  }
});

// get today's challenge endpoint - uses daily.ts system
router.get('/api/challenge', async (_req, res): Promise<void> => {
  try {
    const { dateUTC, image } = await getDailyImage();
    
    // don't expose the answer labels to the client
    res.json({
      dateUTC,
      image: {
        id: image.id,
        name: image.name,
        imageUrl: image.imageUrl,
        thumbUrl: image.thumbUrl,
        width: image.width,
        height: image.height
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: `Server error: ${e?.message ?? 'unknown'}` });
  }
});

// image proxy endpoint to bypass CSP restrictions (needed for external URLs)
router.get('/api/image-proxy', async (req, res): Promise<void> => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      res.status(400).json({ error: 'Missing url parameter' });
      return;
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Image proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy image' });
  }
});

// mount image proxy on app too
app.get('/api/image-proxy', async (req, res): Promise<void> => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      res.status(400).json({ error: 'Missing url parameter' });
      return;
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Image proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy image' });
  }
});

// clear all Redis data (development/testing only)
router.post('/api/clear-redis', async (_req, res): Promise<void> => {
  try {
    // clear all daily.ts data
    const allIds = await redis.get('images:all');
    if (allIds) {
      const ids = JSON.parse(allIds);
      for (const id of ids) {
        await redis.del(`img:${id}`);
      }
    }
    await redis.del('images:all');
    await redis.del('images:lastUsed');
    
    // clear daily cache (current and a few days)
    const today = new Date();
    for (let i = -2; i <= 2; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().slice(0, 10);
      await redis.del(`daily:${dateKey}`);
    }
    
    console.log('✅ Redis cleared successfully');
    res.json({ status: 'success', message: 'Redis cleared successfully' });
  } catch (error: any) {
    console.error('💥 Redis clear error:', error);
    res.status(500).json({ error: `Failed to clear Redis: ${error.message}` });
  }
});

// debug endpoint to reset daily challenge
router.post('/api/debug-reset-daily', async (_req, res): Promise<void> => {
  try {
    const { _debugResetDaily } = await import('./core/daily.js');
    await _debugResetDaily();
    res.json({ status: 'ok', message: 'Daily challenge reset' });
  } catch (error: any) {
    console.error('Failed to reset daily:', error);
    res.status(500).json({ error: `Failed to reset daily: ${error.message}` });
  }
});

// mount clear endpoint on app too
app.post('/api/clear-redis', async (_req, res): Promise<void> => {
  try {
    // clear all daily.ts data
    const allIds = await redis.get('images:all');
    if (allIds) {
      const ids = JSON.parse(allIds);
      for (const id of ids) {
        await redis.del(`img:${id}`);
      }
    }
    await redis.del('images:all');
    await redis.del('images:lastUsed');
    
    // clear daily cache (current and a few days)
    const today = new Date();
    for (let i = -2; i <= 2; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().slice(0, 10);
      await redis.del(`daily:${dateKey}`);
    }
    
    console.log('✅ Redis cleared successfully');
    res.json({ status: 'success', message: 'Redis cleared successfully' });
  } catch (error: any) {
    console.error('💥 Redis clear error:', error);
    res.status(500).json({ error: `Failed to clear Redis: ${error.message}` });
  }
});

// debug endpoint to reset daily challenge (mounted on app too)
app.post('/api/debug-reset-daily', async (_req, res): Promise<void> => {
  try {
    const { _debugResetDaily } = await import('./core/daily.js');
    await _debugResetDaily();
    res.json({ status: 'ok', message: 'Daily challenge reset' });
  } catch (error: any) {
    console.error('Failed to reset daily:', error);
    res.status(500).json({ error: `Failed to reset daily: ${error.message}` });
  }
});

// simple API test endpoint (no external HTTP calls)
router.get('/api/test-basic', async (_req, res): Promise<void> => {
  res.json({ 
    status: 'success', 
    message: 'Basic API working',
    timestamp: new Date().toISOString(),
    version: '0.0.20'
  });
});

// COMMENTED OUT: HTTP test endpoint no longer needed with Redis-only setup
/*
// HTTP permissions test endpoint
router.get('/api/test-http', async (_req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const r = await fetch('https://api.openverse.org/v1/images/?q=test&page_size=1');
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      return res.status(502).json({ status: 'error', message: `Upstream ${r.status}`, body: body.slice(0,200) });
    }
    const data = await r.json();
    res.json({ status: 'success', testData: data?.results?.[0]?.title ?? null });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err?.message ?? 'unknown' });
  }
});
*/

console.log(`[BOOT] server entry loaded from`, import.meta.url);

import type { Response } from 'express';
import { addImage, getDailyImage } from './core/daily';

// --- request logger (see requests in your dev terminal)
app.use((req, _res, next) => {
  console.log(`[web] ${req.method} ${req.url}`);
  next();
});

// --- handlers (so we can mount on both app and router safely)
const imagesHandler = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, name, labels, imageUrl, thumbUrl, width, height } = req.body ?? {};
    if (!name || !Array.isArray(labels) || !imageUrl) {
      return res.status(400).json({
        status: 'error',
        message:
          'Body must be { name: string, labels: string[], imageUrl: string, thumbUrl?, width?, height? }',
      });
    }
    const out = await addImage({ id, name, labels, imageUrl, thumbUrl, width, height });
    return res.status(201).json({ status: 'ok', id: out.id });
  } catch (e: any) {
    console.error('POST /api/images:', e);
    return res
      .status(500)
      .json({ status: 'error', message: e?.message ?? 'Internal error' });
  }
};

const dailyHandler = async (_req: Request, res: Response) => {
  try {
    const { dateUTC, image } = await getDailyImage();
    return res.json({ status: 'ok', dateUTC, daily: image });
  } catch (e: any) {
    console.error('GET /api/daily:', e);
    const msg = e?.message ?? 'Internal error';
    const code = msg.includes('No images seeded') ? 404 : 500;
    return res.status(code).json({ status: 'error', message: msg });
  }
};

// --- define all routes on the router (like your /api/test-basic)
router.get('/api/test-basic', (_req, res) => {
  res.json({
    status: 'success',
    message: 'Basic API working',
    timestamp: new Date().toISOString(),
    version: '0.0.20',
  });
});
router.post('/api/images', imagesHandler);
router.get('/api/daily', dailyHandler);

// --- also mount on app directly (safety net if a different router is mounted)
app.post('/api/images', imagesHandler);
app.get('/api/daily', dailyHandler);

// mount guess and challenge endpoints on app too
app.post('/api/guess', async (req, res): Promise<void> => {
  try {
    const body = req.body as GuessRequest;
    const guess: string = body?.guess ?? '';

    // get today's daily image
    const { image } = await getDailyImage();
    
    // grade the guess against all labels
    const result = gradeAnswer(guess, image.labels[0] ?? '', image.labels);

    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: `Bad request: ${e?.message ?? 'unknown'}` });
  }
});

app.get('/api/challenge', async (_req, res): Promise<void> => {
  try {
    const { dateUTC, image } = await getDailyImage();
    
    // don't expose the answer labels to the client
    res.json({
      dateUTC,
      image: {
        id: image.id,
        name: image.name,
        imageUrl: image.imageUrl,
        thumbUrl: image.thumbUrl,
        width: image.width,
        height: image.height
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: `Server error: ${e?.message ?? 'unknown'}` });
  }
});

// old base64 handler removed - now using URL-based storage

// // --- routes debugger on BOTH router and app
// const routesDebugger = (_req: Request, res: Response) => {
//   // @ts-ignore access internal stacks
//   const collect = (stack: any[]) =>
//     (stack || [])
//       .flatMap((layer: any) => {
//         if (layer.route?.path) {
//           const methods = Object.keys(layer.route.methods)
//             .join(',')
//             .toUpperCase();
//           return [`${methods} ${layer.route.path}`];
//         }
//         if (layer.handle?.stack) return collect(layer.handle.stack);
//         return [];
//       });

//   // @ts-ignore
//   const appRoutes = collect((app as any)._router?.stack);
//   // @ts-ignore
//   const routerRoutes = collect((router as any).stack);

//   console.log('[routes] app:', appRoutes);
//   console.log('[routes] router:', routerRoutes);

//   res.json({ appRoutes, routerRoutes });
// };
// router.get('/api/_debug/routes', routesDebugger);
// app.get('/api/_debug/routes', routesDebugger);

// --- mount the router then start Devvit server ONCE
app.use(router);

const server = createServer(app);
const port = getServerPort();
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`🚀 Devvit server running on ${port}`));

export default app;