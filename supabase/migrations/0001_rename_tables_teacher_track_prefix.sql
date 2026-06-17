-- Namespace this app's tables in the shared Supabase project with a Teacher_track_ prefix.
-- ALTER TABLE ... RENAME preserves the table OID, so RLS, policies, grants, indexes,
-- foreign keys, and realtime publication membership all carry over automatically.
-- These tables are referenced only by application code (.from()); no DB functions or
-- views depend on them, so nothing else needs rewriting.
begin;
alter table public.teachers               rename to "Teacher_track_teachers";
alter table public.qualifications         rename to "Teacher_track_qualifications";
alter table public.teacher_qualifications rename to "Teacher_track_teacher_qualifications";
commit;
