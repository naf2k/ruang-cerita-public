export function minutesOf(content: string) {
  const words = (content ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

export const CATEGORY_LABEL: Record<string, string> = {
  relationship: "Relationship",
  family: "Family",
  student: "Student",
  self: "Self",
};

export const COVER_CLASS = ["a-cover c1", "a-cover c2", "a-cover c3"];
