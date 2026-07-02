import { mintId, type NodeId, type ResearchRule, type ResearchTaskRow } from "@excursed/schema";

/* Shared task identity + construction, used by both the rule generators and
   the R6 refresh driver (kept out of rules.ts so refresh.ts and rules.ts can
   import it without a cycle). */

export interface RuleOptions {
  now?: string;
}

export const isoNow = (): string => new Date().toISOString();

export function firstLine(text: string): string {
  const idx = text.indexOf("\n");
  return idx === -1 ? text : text.slice(0, idx);
}

/* A task's identity: (rule, sorted targets, first brief line). Rules are
   deterministic over the graph, so re-derivation reproduces identities and
   idempotency falls out. Worker error notes append on LATER brief lines so a
   rejected task keeps its identity and is never re-created alongside itself. */
export function taskKey(t: Pick<ResearchTaskRow, "rule" | "targets" | "brief">): string {
  return `${t.rule}|${[...t.targets].sort().join(",")}|${firstLine(t.brief)}`;
}

export function existingKeys(existing: readonly ResearchTaskRow[]): Set<string> {
  return new Set(existing.map(taskKey));
}

export function makeTask(
  rule: ResearchRule,
  form: ResearchTaskRow["form"],
  targets: NodeId[],
  brief: string,
  now: string,
  ownerAction?: string,
): ResearchTaskRow {
  const task: ResearchTaskRow = {
    id: mintId("research"),
    rule,
    form,
    targets,
    brief,
    status: "pending",
    resultClaimIds: [],
    createdAt: now,
  };
  if (ownerAction !== undefined) task.ownerAction = ownerAction;
  return task;
}
