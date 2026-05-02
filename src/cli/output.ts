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
  const tabular = extractTabular(data);
  if (tabular) {
    process.stdout.write(formatTable(tabular.rows) + "\n");
    if (tabular.footer) process.stdout.write("\n" + tabular.footer + "\n");
    return;
  }
  if (typeof data === "object") {
    process.stdout.write(formatKv(data as Record<string, unknown>) + "\n");
    return;
  }
  process.stdout.write(String(data) + "\n");
}

// Tally responses use varying array field names per resource:
// forms/workspaces use `items`; submissions use `submissions`; webhooks use `webhooks`; etc.
// Total count field is either `total` or `totalCount`.
const ROW_FIELDS = [
  "items",
  "submissions",
  "webhooks",
  "questions",
  "blocks",
  "forms",
  "workspaces",
  "users",
  "invites",
  "events",
];

interface Tabular {
  rows: unknown[];
  footer?: string;
}

function extractTabular(d: unknown): Tabular | null {
  if (!d || typeof d !== "object") return null;
  const o = d as Record<string, unknown>;
  let rowsField: string | null = null;
  for (const f of ROW_FIELDS) {
    if (Array.isArray(o[f])) {
      rowsField = f;
      break;
    }
  }
  if (!rowsField) return null;
  const rows = o[rowsField] as unknown[];
  const total =
    typeof o.total === "number"
      ? o.total
      : typeof o.totalCount === "number"
        ? o.totalCount
        : undefined;
  let footer: string | undefined;
  if (typeof o.page === "number") {
    const totalStr = total !== undefined ? `/${total}` : "";
    footer = `page ${o.page} • ${rows.length}${totalStr} • hasMore=${o.hasMore ?? false}`;
  } else if (total !== undefined) {
    footer = `${rows.length}/${total}`;
  }
  return { rows, footer };
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
