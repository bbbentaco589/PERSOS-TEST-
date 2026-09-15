import { createHmac } from "node:crypto";

export function anonymousRunsForDate(date: string, secret: string): 1 | 2 | 3 | 4 {
  const digest = createHmac("sha256", secret).update(`anonymous:${date}`).digest();
  const draw = digest.readUInt32BE(0) / 0x1_0000_0000;
  if (draw < 0.1) return 1;
  if (draw < 0.45) return 2;
  if (draw < 0.8) return 3;
  return 4;
}

export function anonymousSlotEnabled(date: string, secret: string, slot: number) {
  return Number.isInteger(slot) && slot >= 1 && slot <= anonymousRunsForDate(date, secret);
}

export function koreaDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
