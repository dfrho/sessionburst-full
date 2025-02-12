import { z } from 'zod'

export const replayEventSchema = z.object({
  timestamp: z.string().datetime(),
  type: z.enum(['navigation', 'click', 'input', 'scroll', 'custom']),
  data: z.record(z.any())
})

export const replayMetadataSchema = z.object({
  duration: z.string(),
  browser: z.string(),
  viewport: z.string(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime()
})

export const sessionReplaySchema = z.object({
  events: z.array(replayEventSchema),
  metadata: replayMetadataSchema
})

export const sessionSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  user_id: z.string().uuid(),
  stagehand_session_id: z.string(),
  actions: z.array(z.any()),
  options: z.record(z.any()),
  status: z.enum(['created', 'running', 'completed', 'failed']),
  replay: sessionReplaySchema.nullable(),
  replay_url: z.string().url().nullable(),
  error: z.string().optional()
})

export type ValidSession = z.infer<typeof sessionSchema> 