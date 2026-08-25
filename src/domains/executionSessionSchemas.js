import { z } from 'zod'

const idSchema = z.union([
  z.string().uuid(),
  z.string().min(1).max(200),
  z.number().int().nonnegative()
])

const timestamp = z.string().datetime()
const nullableTimestamp = timestamp.nullable().optional()
const text = (max) => z.string().trim().min(1).max(max)

export const executionSessionStatusSchema = z.enum([
  'in_progress',
  'paused',
  'completed',
  'cancelled'
])

export const executionSessionActivityTypeSchema = z.enum([
  'task',
  'project_task',
  'chore'
])

export const executionSessionSchema = z.object({
  id: idSchema.optional(),
  user_id: idSchema,
  activity_id: text(200),
  activity_type: executionSessionActivityTypeSchema,
  source_id: idSchema,
  source_parent_id: idSchema.nullable().optional(),
  title_snapshot: text(200),
  status: executionSessionStatusSchema,
  started_at: timestamp,
  paused_at: nullableTimestamp,
  resumed_at: nullableTimestamp,
  completed_at: nullableTimestamp,
  cancelled_at: nullableTimestamp,
  created_at: timestamp.optional(),
  updated_at: timestamp.optional()
}).strict()

export const executionSessionCreateSchema = executionSessionSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({
    status: z.literal('in_progress'),
    paused_at: z.null().optional(),
    resumed_at: z.null().optional(),
    completed_at: z.null().optional(),
    cancelled_at: z.null().optional()
  })
  .strict()

export const executionSessionPatchSchema = z.object({
  status: executionSessionStatusSchema.optional(),
  paused_at: nullableTimestamp,
  resumed_at: nullableTimestamp,
  completed_at: nullableTimestamp,
  cancelled_at: nullableTimestamp
}).strict().refine((value) => Object.keys(value).length > 0, 'At least one execution-session field is required.')
