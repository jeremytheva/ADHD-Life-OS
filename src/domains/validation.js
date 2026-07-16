import { DomainValidationError } from '../infrastructure/nocodebackend/errors'

/**
 * Validates untrusted browser input before it is passed to a domain service.
 * The flattened Zod issues make this safe to render as a field-error map.
 */
export const validateFormSubmission = (schema, value, message = 'Invalid form submission.') => {
  const result = schema.safeParse(value)
  if (!result.success) throw new DomainValidationError(message, result.error.flatten())
  return result.data
}
