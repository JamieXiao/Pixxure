export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

export type ChallengeRow = {
  challenge_date: string; // yyyy-mm-dd
  openverse_id: string;
  image_url: string;
  thumb_url?: string | null;
  title?: string | null;
  tags?: any;
  license_slug?: string | null;
  license_version?: string | null;
  provider?: string | null;
  source_url?: string | null;
  attribution?: string | null;
  mature?: boolean | null;
  width?: number | null;
  height?: number | null;
  label: string;
  aliases: string[];
};

export type GuessRequest = { guess: string; user?: string };
export type GuessResult = { correct: boolean; reason?: 'exact'|'typo'|'tokens' };
