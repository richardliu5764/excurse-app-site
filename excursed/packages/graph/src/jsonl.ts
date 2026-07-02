import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import type { z } from "zod";

/* Append-only JSONL with zod validation at both boundaries. Every write is
   temp-file + rename so a crash mid-write leaves the previous file intact —
   these files live in git and a torn line would poison every later read. */

export class JsonlStoreError extends Error {
  constructor(
    message: string,
    readonly file: string,
    readonly line?: number,
  ) {
    super(line === undefined ? `${file}: ${message}` : `${file}:${line}: ${message}`);
    this.name = "JsonlStoreError";
  }
}

function formatZodIssues(err: z.ZodError): string {
  return err.issues.map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message)).join("; ");
}

function isZodError(e: unknown): e is z.ZodError {
  return typeof e === "object" && e !== null && (e as { name?: string }).name === "ZodError";
}

export function atomicWriteFile(file: string, content: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmp, content, "utf8");
  fs.renameSync(tmp, file);
}

export class JsonlStore<T> {
  /* Input side of the schema is `any` on purpose: zod object schemas with
     .default() fields have a narrower input type than output, and the store
     always re-parses on the way in anyway. */
  constructor(
    readonly file: string,
    protected readonly schema: z.ZodType<T, z.ZodTypeDef, any>,
  ) {}

  private validate(item: unknown, line?: number): T {
    try {
      return this.schema.parse(item);
    } catch (e) {
      if (isZodError(e)) throw new JsonlStoreError(formatZodIssues(e), this.file, line);
      throw e;
    }
  }

  loadAll(): T[] {
    if (!fs.existsSync(this.file)) return [];
    const raw = fs.readFileSync(this.file, "utf8");
    const out: T[] = [];
    const lines = raw.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i]!.trim();
      if (text === "") continue;
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new JsonlStoreError("corrupt line: not valid JSON", this.file, i + 1);
      }
      out.push(this.validate(parsed, i + 1));
    }
    return out;
  }

  append(item: T): T {
    return this.appendMany([item])[0]!;
  }

  appendMany(items: readonly T[]): T[] {
    const parsed = items.map((it) => this.validate(it));
    if (parsed.length === 0) return [];
    const prev = fs.existsSync(this.file) ? fs.readFileSync(this.file, "utf8") : "";
    const head = prev !== "" && !prev.endsWith("\n") ? prev + "\n" : prev;
    const next = head + parsed.map((p) => JSON.stringify(p) + "\n").join("");
    atomicWriteFile(this.file, next);
    return parsed;
  }

  /* Amend is NOT delete: the mapper must return one record per input record
     (marking, e.g. invalidatedAt / extractedBy), and the whole file is
     rewritten atomically. Returns how many records changed. */
  amend(map: (item: T) => T): number {
    const all = this.loadAll();
    let changed = 0;
    const next = all.map((item) => {
      const mapped = this.validate(map(item));
      if (JSON.stringify(mapped) !== JSON.stringify(item)) changed++;
      return mapped;
    });
    if (next.length !== all.length) {
      throw new JsonlStoreError("amend must preserve record count (invalidate, never delete)", this.file);
    }
    if (changed > 0) atomicWriteFile(this.file, next.map((p) => JSON.stringify(p) + "\n").join(""));
    return changed;
  }
}
