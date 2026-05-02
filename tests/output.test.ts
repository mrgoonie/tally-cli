import { describe, it, expect, vi } from "vitest";
import { emit } from "../src/cli/output.js";

function capture(fn: () => void): string {
  const chunks: string[] = [];
  const spy = vi
    .spyOn(process.stdout, "write")
    .mockImplementation((c: string | Uint8Array) => {
      chunks.push(typeof c === "string" ? c : Buffer.from(c).toString());
      return true;
    });
  try {
    fn();
  } finally {
    spy.mockRestore();
  }
  return chunks.join("");
}

describe("output renderer", () => {
  it("renders {items} pagination as table", () => {
    const out = capture(() =>
      emit({
        page: 1,
        limit: 10,
        total: 2,
        hasMore: false,
        items: [
          { id: "a", name: "A" },
          { id: "b", name: "B" },
        ],
      }),
    );
    expect(out).toContain("id");
    expect(out).toContain("name");
    expect(out).toContain("page 1 • 2/2");
  });

  it("renders {submissions} pagination as table", () => {
    const out = capture(() =>
      emit({
        page: 1,
        limit: 5,
        hasMore: true,
        totalNumberOfSubmissionsPerFilter: { all: 13 },
        submissions: [{ id: "s1", isCompleted: true }],
      }),
    );
    expect(out).toContain("id");
    expect(out).toContain("s1");
    expect(out).toContain("page 1");
    expect(out).toContain("hasMore=true");
  });

  it("renders {webhooks} with totalCount", () => {
    const out = capture(() =>
      emit({
        page: 1,
        limit: 25,
        hasMore: false,
        totalCount: 0,
        webhooks: [],
      }),
    );
    expect(out).toContain("(no results)");
    expect(out).toContain("page 1 • 0/0");
  });

  it("renders {questions} without page metadata", () => {
    const out = capture(() =>
      emit({
        hasResponses: true,
        questions: [
          { id: "q1", type: "INPUT_TEXT", title: "Email?" },
          { id: "q2", type: "DROPDOWN", title: "Industry?" },
        ],
      }),
    );
    expect(out).toContain("id");
    expect(out).toContain("title");
    expect(out).toContain("Email?");
  });

  it("--json passes through raw", () => {
    const out = capture(() => emit({ a: 1 }, { json: true }));
    expect(out.trim()).toBe('{\n  "a": 1\n}');
  });
});
