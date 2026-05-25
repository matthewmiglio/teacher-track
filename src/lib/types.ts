export type Status = "incomplete" | "in_progress" | "done";

export type Teacher = {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
};

export type Qualification = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Assignment = {
  id: string;
  teacher_id: string;
  qualification_id: string;
  status: Status;
  updated_at: string;
};

export type TeacherWithAssignments = Teacher & {
  assignments: (Assignment & { qualification: Qualification })[];
};

export const STATUS_LABEL: Record<Status, string> = {
  incomplete: "Incomplete",
  in_progress: "In progress",
  done: "Done",
};

export const STATUS_ORDER: Status[] = ["incomplete", "in_progress", "done"];
