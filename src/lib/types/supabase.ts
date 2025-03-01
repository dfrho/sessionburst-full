// lib/types/supabase.ts
import { z } from 'zod';

export type SessionStatus = 'created' | 'running' | 'completed' | 'failed';

export type SessionAction = {
  type: 'goto' | 'act' | 'extract' | 'observe';
  value: string;
  schema?: z.ZodType<unknown>; // Replace any with ZodType
};

export type SessionOptions = {
  browser?: 'chromium' | 'firefox' | 'webkit';
  device?: string;
  location?: string;
  utm_params?: Record<string, string>;
  context?: {
    extensions?: boolean;
    captchaSolving?: boolean;
  };
};

export type ReplayEvent = {
  type: string;
  timestamp: string;
  data: Record<string, unknown>; // Replace any with Record<string, unknown>
};

export type SessionReplay = {
  events: ReplayEvent[];
  metadata: {
    duration: string;
    browser: string;
    viewport: string;
  };
};

export type Session = {
  id: number;
  user_id: string;
  stagehand_session_id: string;
  actions: SessionAction[];
  options?: SessionOptions;
  status: SessionStatus;
  replay?: SessionReplay;
  replay_url?: string;
  created_at: string;
  updated_at: string;
};