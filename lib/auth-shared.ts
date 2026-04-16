export function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function usernameToEmail(username: string) {
  return `${normalizeUsername(username)}@flagstats.local`;
}
