export const ONLINE_WINDOW_MS = 45_000;

export function isOnline(lastSeen: number, now: number): boolean {
  return now - lastSeen < ONLINE_WINDOW_MS;
}
