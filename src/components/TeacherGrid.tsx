"use client";

import type { Qualification, Status, TeacherWithAssignments } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";

const NEXT: Record<Status, Status> = {
  incomplete: "in_progress",
  in_progress: "done",
  done: "incomplete",
};

const CELL_BG: Record<Status, string> = {
  done: "#22c55e",
  in_progress: "#facc15",
  incomplete: "#ef4444",
};

type Props = {
  teachers: TeacherWithAssignments[];
  qualifications: Qualification[];
  busyId: string | null;
  onCycle: (assignmentId: string, current: Status) => void;
};

export function TeacherGrid({ teachers, qualifications, busyId, onCycle }: Props) {
  if (teachers.length === 0) return null;

  // Hide qualification columns that no teacher has been assigned.
  const assignedQualIds = new Set<string>();
  for (const t of teachers) for (const a of t.assignments) assignedQualIds.add(a.qualification_id);

  // Canonical column order: qualifications sorted by name (stable across renders / status changes).
  const cols = qualifications
    .filter(q => assignedQualIds.has(q.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="card overflow-x-auto">
      <div className="card-title">Teacher progress grid</div>

      <div className="inline-block min-w-full">
        {/* Header row: name spacer + rotated qualification labels */}
        <div className="flex items-end gap-1.5 mb-2 pl-[var(--name-col,160px)]" style={{ ["--name-col" as string]: "160px" }}>
          {cols.map(q => (
            <div
              key={q.id}
              className="w-10 sm:w-12 flex justify-center"
              style={{ height: 100 }}
            >
              <div
                className="text-xs text-[var(--color-muted)] whitespace-nowrap overflow-hidden text-ellipsis origin-bottom-left"
                style={{
                  transform: "rotate(-55deg) translateY(8px)",
                  width: 120,
                  textAlign: "left",
                }}
                title={q.name}
              >
                {q.name}
              </div>
            </div>
          ))}
        </div>

        {/* Teacher rows */}
        <div className="flex flex-col gap-1.5">
          {teachers.map(t => {
            const byQual = new Map(t.assignments.map(a => [a.qualification_id, a]));
            return (
              <div key={t.id} className="flex items-center gap-1.5">
                <div
                  className="text-sm font-medium text-[var(--foreground)] truncate shrink-0 pr-3"
                  style={{ width: 160 }}
                  title={t.email ?? undefined}
                >
                  {t.name}
                </div>
                {cols.map(q => {
                  const a = byQual.get(q.id);
                  if (!a) {
                    return (
                      <div
                        key={q.id}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-md"
                        style={{
                          backgroundColor: "#3a3a4a",
                          border: "2px solid var(--cell-border)",
                          boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.18)",
                          opacity: 0.45,
                        }}
                        title={`${t.name} — not assigned to ${q.name}`}
                      />
                    );
                  }
                  return (
                    <button
                      key={a.id}
                      disabled={busyId === a.id}
                      onClick={() => onCycle(a.id, a.status)}
                      title={`${q.name} — ${STATUS_LABEL[a.status]} (click → ${STATUS_LABEL[NEXT[a.status]]})`}
                      aria-label={`${t.name} ${q.name}: ${STATUS_LABEL[a.status]}`}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-md transition hover:scale-105 active:scale-95 disabled:opacity-50"
                      style={{
                        backgroundColor: CELL_BG[a.status],
                        border: "2px solid var(--cell-border)",
                        boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.18)",
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4 text-xs text-[var(--color-muted)] flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: CELL_BG.done, border: "1.5px solid var(--cell-border)" }} /> Done
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: CELL_BG.in_progress, border: "1.5px solid var(--cell-border)" }} /> In progress
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: CELL_BG.incomplete, border: "1.5px solid var(--cell-border)" }} /> Incomplete
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#3a3a4a", opacity: 0.6, border: "1.5px solid var(--cell-border)" }} /> Not assigned
        </span>
        <span className="ml-auto italic">Click a cell to cycle status.</span>
      </div>
    </div>
  );
}
