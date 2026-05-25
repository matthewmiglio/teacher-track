"use client";

import type { Status, TeacherWithAssignments } from "@/lib/types";
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
  busyId: string | null;
  onCycle: (assignmentId: string, current: Status) => void;
};

export function TeacherGrid({ teachers, busyId, onCycle }: Props) {
  if (teachers.length === 0) return null;

  const nameColWidth = Math.max(
    96,
    ...teachers.map(t => Math.min(220, t.name.length * 9 + 16))
  );

  return (
    <div className="card overflow-x-auto">
      <div className="card-title">Teacher progress grid</div>
      <div className="flex flex-col gap-3 min-w-fit">
        {teachers.map(t => (
          <div key={t.id} className="flex items-center gap-4">
            <div
              className="text-sm font-medium text-[var(--foreground)] truncate shrink-0"
              style={{ width: nameColWidth }}
              title={t.email ?? undefined}
            >
              {t.name}
            </div>
            {t.assignments.length === 0 ? (
              <div className="text-xs text-[var(--color-muted)] italic">
                no qualifications assigned
              </div>
            ) : (
              <div className="flex gap-1.5">
                {t.assignments.map(a => (
                  <button
                    key={a.id}
                    disabled={busyId === a.id}
                    onClick={() => onCycle(a.id, a.status)}
                    title={`${a.qualification?.name ?? ""} — ${STATUS_LABEL[a.status]}`}
                    aria-label={`${a.qualification?.name ?? ""}: ${STATUS_LABEL[a.status]}. Click to advance to ${STATUS_LABEL[NEXT[a.status]]}.`}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-md transition hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{
                      backgroundColor: CELL_BG[a.status],
                      border: "2px solid #0f172a",
                      boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.15)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-4 text-xs text-[var(--color-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: CELL_BG.done, border: "1.5px solid #0f172a" }} /> Done
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: CELL_BG.in_progress, border: "1.5px solid #0f172a" }} /> In progress
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: CELL_BG.incomplete, border: "1.5px solid #0f172a" }} /> Incomplete
        </span>
        <span className="ml-auto italic">Click a cell to cycle status.</span>
      </div>
    </div>
  );
}
