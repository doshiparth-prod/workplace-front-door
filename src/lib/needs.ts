import type { TKey } from "./i18n";
import type { NeedId } from "./types";

export const NEEDS: { id: NeedId; icon: string; label: TKey; desc: TKey }[] = [
  { id: "job", icon: "💼", label: "need_job", desc: "need_job_desc" },
  { id: "training", icon: "🎓", label: "need_training", desc: "need_training_desc" },
  { id: "career", icon: "🧭", label: "need_career", desc: "need_career_desc" },
  { id: "youth", icon: "🌱", label: "need_youth", desc: "need_youth_desc" },
  { id: "employer", icon: "🏭", label: "need_employer", desc: "need_employer_desc" },
];

export const needLabel: Record<NeedId, TKey> = {
  job: "need_job",
  training: "need_training",
  career: "need_career",
  youth: "need_youth",
  employer: "need_employer",
};
