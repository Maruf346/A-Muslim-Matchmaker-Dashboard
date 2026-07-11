export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function formatFieldErrors(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    return value.flatMap((item) => formatFieldErrors(item));
  }
  return [];
}

export function parseApiError(data: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!data || typeof data !== "object") return fallback;

  const record = data as Record<string, unknown>;

  if (typeof record.detail === "string" && record.detail.trim()) {
    return record.detail;
  }

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }

  if (Array.isArray(record.non_field_errors)) {
    const messages = formatFieldErrors(record.non_field_errors);
    if (messages.length) return messages.join(" ");
  }

  const fieldMessages = Object.entries(record)
    .filter(([key]) => key !== "detail" && key !== "message")
    .flatMap(([, value]) => formatFieldErrors(value))
    .filter(Boolean);

  if (fieldMessages.length) return fieldMessages.join(" ");

  return fallback;
}
