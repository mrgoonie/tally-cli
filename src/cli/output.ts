export interface OutputOptions {
  json?: boolean;
}

export function emit(data: unknown, opts: OutputOptions = {}): void {
  if (opts.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
    return;
  }
  if (data === undefined || data === null) {
    process.stdout.write("OK\n");
    return;
  }
  if (Array.isArray(data)) {
    process.stdout.write(formatTable(data) + "\n");
    return;
  }
  if (isPaginated(data)) {
    process.stdout.write(formatTable(data.items) + "\n");
    process.stdout.write(
      `\npage ${data.page} • ${data.items.length}/${data.total} • hasMore=${data.hasMore}\n`,
    );
    return;
  }
  if (typeof data === "object") {
    process.stdout.write(formatKv(data as Record<string, unknown>) + "\n");
    return;
  }
  process.stdout.write(String(data) + "\n");
}

interface PaginatedShape {
  page: number;
  total: number;
  hasMore: boolean;
  items: unknown[];
}
function isPaginated(d: unknown): d is PaginatedShape {
  return (
    !!d &&
    typeof d === "object" &&
    Array.isArray((d as Record<string, unknown>).items) &&
    typeof (d as Record<string, unknown>).page === "number"
  );
}

function formatTable(rows: unknown[]): string {
  if (rows.length === 0) return "(no results)";
  const objects = rows.filter(
    (r): r is Record<string, unknown> => !!r && typeof r === "object",
  );
  if (objects.length === 0) return rows.map(String).join("\n");

  const preferred = ["id", "name", "title", "url", "status", "email"];
  const seen = new Set<string>();
  const headers: string[] = [];
  for (const k of preferred) {
    if (objects.some((o) => k in o)) {
      headers.push(k);
      seen.add(k);
    }
  }
  for (const o of objects) {
    for (const k of Object.keys(o)) {
      if (seen.has(k)) continue;
      if (typeof o[k] === "object" && o[k] !== null) continue;
      headers.push(k);
      seen.add(k);
      if (headers.length >= 6) break;
    }
    if (headers.length >= 6) break;
  }

  const widths = headers.map((h) =>
    Math.max(h.length, ...objects.map((o) => stringify(o[h]).length)),
  );
  const sep = headers.map((_, i) => "-".repeat(widths[i] ?? 0)).join("  ");
  const head = headers.map((h, i) => h.padEnd(widths[i] ?? 0)).join("  ");
  const lines = objects.map((o) =>
    headers.map((h, i) => stringify(o[h]).padEnd(widths[i] ?? 0)).join("  "),
  );
  return [head, sep, ...lines].join("\n");
}

function formatKv(o: Record<string, unknown>): string {
  return Object.entries(o)
    .map(([k, v]) => `${k}: ${stringify(v)}`)
    .join("\n");
}

function stringify(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function fail(message: string, exitCode = 1): never {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(exitCode);
}
