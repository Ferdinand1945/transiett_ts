export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function fallbackMessage(status: number): string {
  if (status === 404) return "Not found";
  if (status === 400) return "Invalid request";
  if (status >= 500) return "Server error";
  return "Request failed";
}

function parseErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === "object" && "error" in body) {
    const error = (body as { error: unknown }).error;
    if (typeof error === "string" && error.trim()) return error;
  }
  return fallbackMessage(status);
}

export async function requestJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(parseErrorMessage(body, res.status), res.status);
  }

  return body as T;
}
