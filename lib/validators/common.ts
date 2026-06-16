export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function validationError<T>(error: string): ValidationResult<T> {
  return { success: false, error };
}
