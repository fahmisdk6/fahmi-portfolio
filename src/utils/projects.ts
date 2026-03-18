import type { CollectionEntry } from "astro:content";

export const PROJECT_CATEGORIES = ["professional", "personal", "open-source"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  professional: "Professional",
  personal: "Personal",
  "open-source": "Open Source",
};

export const CATEGORY_DESCRIPTIONS: Record<ProjectCategory, string> = {
  professional: "Production apps serving millions of users",
  personal: "Side projects and experiments",
  "open-source": "Contributions to the community",
};

export function sortByDateDesc<T extends { data: { date: Date } }>(items: T[]): T[] {
  return items.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function groupByCategory(
  projects: CollectionEntry<"projects">[]
): Record<ProjectCategory, CollectionEntry<"projects">[]> {
  return Object.fromEntries(
    PROJECT_CATEGORIES.map((cat) => [cat, projects.filter((p) => p.data.category === cat)])
  ) as Record<ProjectCategory, CollectionEntry<"projects">[]>;
}
