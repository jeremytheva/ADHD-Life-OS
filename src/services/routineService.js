import { repositories } from '../infrastructure/nocodebackend/repositories'
import { requireAuthenticatedUser } from '../infrastructure/nocodebackend/errors'
import { getDatabaseUserId } from './authStorage'
import { routineFormSchema, routineStepFormSchema } from '../domains/schemas'
import { validateFormSubmission } from '../domains/validation'
const userId = () => requireAuthenticatedUser(getDatabaseUserId())
const step = (routineId, value, index) => {
  const data = validateFormSubmission(routineStepFormSchema, { ...value, order_index: index }, 'Invalid routine step submission.')
  return { routine_id: routineId, name: data.name, description: data.description || '', duration_minutes: data.duration_minutes, order_index: index, is_essential: data.is_essential || false, preferred_time: data.preferred_time || null }
}

export const routineService = {
  async getRoutines() { const id = userId(); const [routines, steps] = await Promise.all([repositories.routines.list({ user_id: id }), repositories.routineSteps.list({ user_id: id })]); return routines.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((routine) => ({ ...routine, routine_steps: steps.filter((item) => item.routine_id === routine.id).sort((a, b) => a.order_index - b.order_index) })) },
  async createRoutine(input) { const data = validateFormSubmission(routineFormSchema, input, 'Invalid routine submission.'); const id = userId(); const routine = await repositories.routines.create({ user_id: id, name: data.name, description: data.description || '', repeat_pattern: data.repeat_pattern || 'daily', is_active: data.is_active !== false, mode: data.mode || null, category: data.category || null, tags: data.tags || [] }); const steps = await Promise.all((data.steps || []).map((value, index) => repositories.routineSteps.create({ user_id: id, ...step(routine.id, value, index) }))); return { ...routine, routine_steps: steps } },
  async updateRoutine(routineId, updates) { const id = userId(); const { steps, ...routineUpdates } = updates; const routine = await repositories.routines.update(routineId, { ...routineUpdates, updated_at: new Date().toISOString() }, { user_id: id }); if (!steps) return routine; const prior = await repositories.routineSteps.list({ user_id: id, routine_id: routineId }); await Promise.all(prior.map((item) => repositories.routineSteps.remove(item.id, { user_id: id }))); const created = await Promise.all(steps.map((value, index) => repositories.routineSteps.create({ user_id: id, ...step(routineId, value, index) }))); return { ...routine, routine_steps: created } },
  async deleteRoutine(routineId) { return repositories.routines.remove(routineId, { user_id: userId() }) }
}
