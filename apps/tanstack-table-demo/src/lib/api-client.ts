const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function apiClient<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  if (!API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL")
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json() as Promise<TResponse>
}
