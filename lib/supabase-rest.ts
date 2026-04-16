type QueryValue = string | number | boolean | undefined | null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && serviceRoleKey);

function buildUrl(path: string) {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  return `${supabaseUrl}${path}`;
}

function buildHeaders(extra?: HeadersInit) {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extra
  };
}

export function buildQuery(params: Record<string, QueryValue>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  return search.toString();
}

export async function supabaseAdminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: buildHeaders(init?.headers),
    next: { revalidate: 30 }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${message}`);
  }

  return (await response.json()) as T;
}

export async function fetchTable<T>(table: string, params: Record<string, QueryValue> = {}) {
  const query = buildQuery(params);
  const path = `/rest/v1/${table}${query ? `?${query}` : ""}`;
  return supabaseAdminRequest<T[]>(path);
}
