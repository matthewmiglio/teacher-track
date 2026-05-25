"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Qualification, Teacher, TeacherWithAssignments } from "@/lib/types";

type DashResp = { teachers: TeacherWithAssignments[]; qualifications: Qualification[] };

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return (await r.json()) as T;
}

export default function ManagePage() {
  const [data, setData] = useState<DashResp | null>(null);
  const [loading, setLoading] = useState(true);

  const [tName, setTName] = useState("");
  const [tEmail, setTEmail] = useState("");
  const [qName, setQName] = useState("");
  const [qDesc, setQDesc] = useState("");

  const [assignTeacher, setAssignTeacher] = useState("");
  const [assignQual, setAssignQual] = useState("");

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

  async function addTeacher(e: React.FormEvent) {
    e.preventDefault();
    if (!tName.trim()) return;
    await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tName.trim(), email: tEmail.trim() || null }),
    });
    setTName(""); setTEmail("");
    refresh();
  }

  async function deleteTeacher(id: string) {
    if (!confirm("Delete this teacher? All their qualification assignments will be removed.")) return;
    await fetch(`/api/teachers/${id}`, { method: "DELETE" });
    refresh();
  }

  async function addQual(e: React.FormEvent) {
    e.preventDefault();
    if (!qName.trim()) return;
    await fetch("/api/qualifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: qName.trim(), description: qDesc.trim() || null }),
    });
    setQName(""); setQDesc("");
    refresh();
  }

  async function deleteQual(id: string) {
    if (!confirm("Delete this qualification? It will be unassigned from all teachers.")) return;
    await fetch(`/api/qualifications/${id}`, { method: "DELETE" });
    refresh();
  }

  async function addAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!assignTeacher || !assignQual) return;
    const r = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher_id: assignTeacher, qualification_id: assignQual }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j.error ?? "Could not assign (maybe already assigned).");
    }
    refresh();
  }

  async function unassign(id: string) {
    await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    refresh();
  }

  const teachers: Teacher[] = data?.teachers ?? [];
  const quals: Qualification[] = data?.qualifications ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 w-full">
      <header className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">Create teachers, qualifications, and assign them.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="btn">{loading ? "…" : "Refresh"}</button>
          <Link href="/" className="btn btn-primary">Dashboard</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <section className="card">
          <div className="card-title">Add teacher</div>
          <form onSubmit={addTeacher} className="flex flex-col sm:flex-row gap-2 mb-4">
            <input className="input flex-1" placeholder="Name *" value={tName} onChange={e => setTName(e.target.value)} />
            <input className="input flex-1" placeholder="Email (optional)" value={tEmail} onChange={e => setTEmail(e.target.value)} />
            <button className="btn btn-primary" type="submit">Add</button>
          </form>
          <ul className="flex flex-col">
            {teachers.length === 0 && <li className="text-sm text-[var(--color-muted)] italic">No teachers yet.</li>}
            {teachers.map(t => (
              <li key={t.id} className="flex items-center justify-between gap-2 py-2 border-b border-[var(--color-border)] last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.name}</div>
                  {t.email && <div className="text-xs text-[var(--color-muted)] truncate">{t.email}</div>}
                </div>
                <button onClick={() => deleteTeacher(t.id)} className="btn btn-danger text-xs">Delete</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card-title">Add qualification</div>
          <form onSubmit={addQual} className="flex flex-col sm:flex-row gap-2 mb-4">
            <input className="input flex-1" placeholder="Name *" value={qName} onChange={e => setQName(e.target.value)} />
            <input className="input flex-1" placeholder="Description (optional)" value={qDesc} onChange={e => setQDesc(e.target.value)} />
            <button className="btn btn-primary" type="submit">Add</button>
          </form>
          <ul className="flex flex-col">
            {quals.length === 0 && <li className="text-sm text-[var(--color-muted)] italic">No qualifications yet.</li>}
            {quals.map(q => (
              <li key={q.id} className="flex items-center justify-between gap-2 py-2 border-b border-[var(--color-border)] last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{q.name}</div>
                  {q.description && <div className="text-xs text-[var(--color-muted)] truncate">{q.description}</div>}
                </div>
                <button onClick={() => deleteQual(q.id)} className="btn btn-danger text-xs">Delete</button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <div className="card-title">Assign qualifications</div>
        <form onSubmit={addAssignment} className="flex flex-col sm:flex-row gap-2 mb-4">
          <select className="input flex-1" value={assignTeacher} onChange={e => setAssignTeacher(e.target.value)}>
            <option value="">Select teacher…</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className="input flex-1" value={assignQual} onChange={e => setAssignQual(e.target.value)}>
            <option value="">Select qualification…</option>
            {quals.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
          </select>
          <button className="btn btn-primary" type="submit">Assign</button>
        </form>

        <div className="flex flex-col gap-4">
          {data?.teachers.map(t => (
            <div key={t.id}>
              <div className="text-sm font-semibold mb-2">{t.name}</div>
              {t.assignments.length === 0 ? (
                <div className="text-xs text-[var(--color-muted)] italic">No qualifications assigned.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {t.assignments.map(a => (
                    <span key={a.id} className="status-pill" style={{ background: "var(--panel-2)", color: "var(--foreground)", borderColor: "var(--border)" }}>
                      {a.qualification?.name ?? "—"}
                      <button onClick={() => unassign(a.id)} className="ml-1 text-[var(--color-negative)] hover:underline text-xs">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
