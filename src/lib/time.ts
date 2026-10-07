export function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatChatTime(timestamp: number, now: number): string {
  const delta = now - timestamp;
  if (delta < 60_000) {
    return "now";
  }
  if (delta < 60 * 60_000) {
    return `${Math.floor(delta / 60_000)}m`;
  }
  const date = new Date(timestamp);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  if (timestamp >= startOfToday.getTime()) {
    return formatClock(timestamp);
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatOpensIn(unlockAt: number, now: number): string {
  const delta = unlockAt - now;
  if (delta <= 0) {
    return "Opening…";
  }
  if (delta < 60_000) {
    return `Opens in ${Math.ceil(delta / 1000)}s`;
  }
  if (delta < 60 * 60_000) {
    return `Opens in ${Math.ceil(delta / 60_000)}m`;
  }
  const hours = Math.floor(delta / (60 * 60_000));
  const minutes = Math.ceil((delta % (60 * 60_000)) / 60_000);
  if (hours < 24) {
    return minutes > 0 && minutes < 60 ? `Opens in ${hours}h ${minutes}m` : `Opens in ${hours}h`;
  }
  return `Opens ${new Date(unlockAt).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function formatLastSeen(lastSeen: number, now: number, online: boolean): string {
  if (online) {
    return "Online";
  }
  if (lastSeen <= 0) {
    return "Offline";
  }
  const delta = now - lastSeen;
  if (delta < 60_000) {
    return "Last seen just now";
  }
  if (delta < 60 * 60_000) {
    return `Last seen ${Math.floor(delta / 60_000)}m ago`;
  }
  return `Last seen ${formatChatTime(lastSeen, now)}`;
}
