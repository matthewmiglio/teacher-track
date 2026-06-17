import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const teacher_id = String(body?.teacher_id ?? "");
  const qualification_id = String(body?.qualification_id ?? "");
  if (!teacher_id || !qualification_id) {
    return NextResponse.json({ error: "teacher_id and qualification_id required" }, { status: 400 });
  }
  const sb = supabaseService();
  const { data, error } = await sb
    .from("Teacher_track_teacher_qualifications")
    .insert({ teacher_id, qualification_id, status: "incomplete" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
