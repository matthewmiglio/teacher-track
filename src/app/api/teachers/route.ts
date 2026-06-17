import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

export async function GET() {
  const sb = supabaseService();
  const { data, error } = await sb.from("Teacher_track_teachers").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body?.name ?? "").trim();
  const email = body?.email ? String(body.email).trim() : null;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const sb = supabaseService();
  const { data, error } = await sb.from("Teacher_track_teachers").insert({ name, email }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
