import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toApiError } from "./errors";

/**
 * خطاهای فیلد برگشتی از سرور را به فیلدهای فرم متصل می‌کند.
 * فقط نام‌هایی که در فرم وجود دارند اعمال می‌شوند؛ مقدار برگشتی تعداد خطاهای متصل‌شده است.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  knownFields: readonly string[],
): number {
  const { fieldErrors } = toApiError(error);
  let applied = 0;
  for (const [name, message] of Object.entries(fieldErrors)) {
    if (knownFields.includes(name)) {
      setError(name as Path<T>, { type: "server", message });
      applied += 1;
    }
  }
  return applied;
}
