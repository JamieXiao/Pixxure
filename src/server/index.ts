import express from 'express';
import { InitResponse, IncrementResponse, DecrementResponse } from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

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

// win endpoint
app.post('/api/win', async (req, res) => {
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

  res.json({ status: 'success', stats: parsedStats, message: 'Play recorded' });
});

// play endpoint
app.post('/api/play', async (req, res) => {
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
    parsedStats = { wins: 0, plays: 1, win5: 0, win4: 0, win3: 0, win2: 0, win1: 0, streak: 0, maxStreak: 0, lastPlayed: date };
  }
  await redis.set(`stats:${userId}`, JSON.stringify(parsedStats)); // save back to redis

  res.json({ status: 'success', stats: parsedStats, message: 'Play recorded' });
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

  res.json({ status: 'success', stats: parsedStats, message: 'Play recorded' });
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

  res.json({ status: 'success', stats: parsedStats, message: 'Play recorded' });
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

  res.json({ status: 'success', stats: parsedStats, message: 'Play recorded' });
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

  res.json({ status: 'success', stats: parsedStats, message: 'Play recorded' });
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

  res.json({ status: 'success', stats: parsedStats, message: 'Play recorded' });
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);