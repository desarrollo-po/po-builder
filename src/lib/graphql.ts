// Generic transport for any WPGraphQL endpoint. The endpoint is passed
// per-call so each ContentSource adapter can target its own backend.
export async function fetchGraphQL<T = unknown>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  if (!endpoint) {
    throw new Error("fetchGraphQL: missing endpoint");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    throw new Error(result.errors[0]?.message || "Unknown GraphQL error");
  }

  return result.data as T;
}
