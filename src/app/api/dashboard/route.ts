import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

export async function GET() {
  const sb = supabaseService();
  const [teachersRes, qualsRes, assignsRes] = await Promise.all([
    sb.from("teachers").select("*").order("name"),
    sb.from("qualifications").select("*").order("name"),
    sb.from("teacher_qualifications").select("*"),
  ]);
  if (teachersRes.error) return NextResponse.json({ error: teachersRes.error.message }, { status: 500 });
  if (qualsRes.error) return NextResponse.json({ error: qualsRes.error.message }, { status: 500 });
  if (assignsRes.error) return NextResponse.json({ error: assignsRes.error.message }, { status: 500 });

  const qualMap = new Map((qualsRes.data ?? []).map(q => [q.id, q]));
  const byTeacher = new Map<string, typeof assignsRes.data>();
  for (const a of assignsRes.data ?? []) {
    const list = byTeacher.get(a.teacher_id) ?? [];
    list.push(a);
    byTeacher.set(a.teacher_id, list);
  }

  const teachers = (teachersRes.data ?? []).map(t => ({
    ...t,
    assignments: (byTeacher.get(t.id) ?? []).map(a => ({
      ...a,
      qualification: qualMap.get(a.qualification_id) ?? null,
    })),
  }));

  return NextResponse.json({
    teachers,
    qualifications: qualsRes.data ?? [],
  });
}
