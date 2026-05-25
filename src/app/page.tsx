"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Qualification, Status, TeacherWithAssignments } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { TeacherGrid } from "@/components/TeacherGrid";

type DashResp = { teachers: TeacherWithAssignments[]; qualifications: Qualification[] };

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return (await r.json()) as T;
}

export default function Page() {
  const [data, setData] = useState<DashResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getJSON<DashResp>("/api/dashboard");
      setData(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const stats = useMemo(() => {
    const teachers = data?.teachers ?? [];
    let total = 0, done = 0, ip = 0, inc = 0;
    for (const t of teachers) for (const a of t.assignments) {
      total++;
      if (a.status === "done") done++;
      else if (a.status === "in_progress") ip++;
      else inc++;
    }
    return { teachers: teachers.length, quals: data?.qualifications.length ?? 0, total, done, ip, inc };
  }, [data]);

  async function cycleStatus(assignmentId: string, current: Status) {
    const next: Record<Status, Status> = { incomplete: "in_progress", in_progress: "done", done: "incomplete" };
    setBusyId(assignmentId);
    try {
      await fetch(`/api/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next[current] }),
      });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 w-full">
      <header className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Click any colored cell or status pill to cycle <span className="dot dot-incomplete"></span> → <span className="dot dot-in_progress"></span> → <span className="dot dot-done"></span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="btn">{loading ? "…" : "Refresh"}</button>
          <Link href="/manage" className="btn btn-primary">Manage</Link>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Kpi label="Teachers" value={stats.teachers} />
        <Kpi label="Qualifications" value={stats.quals} />
        <Kpi label="Done" value={stats.done} tone="done" />
        <Kpi label="In progress" value={stats.ip} tone="in_progress" />
        <Kpi label="Incomplete" value={stats.inc} tone="incomplete" />
      </section>

      {data && data.teachers.length > 0 && (
        <section className="mb-6">
          <TeacherGrid teachers={data.teachers} busyId={busyId} onCycle={cycleStatus} />
        </section>
      )}

      {data && data.teachers.length === 0 && (
        <div className="card text-center text-[var(--color-muted)]">
          No teachers yet. <Link href="/manage" className="text-[var(--color-brand-primary)] underline">Add some on the Manage page.</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data?.teachers.map(t => {
          const total = t.assignments.length;
          const done = t.assignments.filter(a => a.status === "done").length;
          const ip = t.assignments.filter(a => a.status === "in_progress").length;
          const inc = total - done - ip;
          return (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-base font-semibold">{t.name}</div>
                  {t.email && <div className="text-xs text-[var(--color-muted)]">{t.email}</div>}
                </div>
                <div className="text-right text-xs text-[var(--color-muted)]">
                  {done}/{total} done
                </div>
              </div>
              {total > 0 && (
                <div className="progress-bar mb-4">
                  <div className="progress-seg progress-done" style={{ width: `${(done / total) * 100}%` }} />
                  <div className="progress-seg progress-in_progress" style={{ width: `${(ip / total) * 100}%` }} />
                  <div className="progress-seg progress-incomplete" style={{ width: `${(inc / total) * 100}%` }} />
                </div>
              )}
              {total === 0 ? (
                <div className="text-sm text-[var(--color-muted)] italic">No qualifications assigned.</div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {t.assignments.map(a => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-[var(--color-border)] last:border-0">
                      <span className="text-sm">{a.qualification?.name ?? "—"}</span>
                      <button
                        disabled={busyId === a.id}
                        onClick={() => cycleStatus(a.id, a.status)}
                        className={`status-pill status-${a.status} hover:opacity-80 transition`}
                        title="Click to cycle status"
                      >
                        <span className={`dot dot-${a.status}`}></span>
                        {STATUS_LABEL[a.status]}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: Status }) {
  return (
    <div className="card">
      <div className="card-title flex items-center gap-2">
        {tone && <span className={`dot dot-${tone}`} />}
        {label}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
