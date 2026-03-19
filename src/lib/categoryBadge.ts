import { categories } from "@/data/categories";

const badgeStyles: Record<string, string> = {
  it: "bg-sky-50 text-sky-700",
  design: "bg-fuchsia-50 text-fuchsia-700",
  marketing: "bg-amber-50 text-amber-700",
  content: "bg-rose-50 text-rose-700",
  finance: "bg-emerald-50 text-emerald-700",
  sales: "bg-orange-50 text-orange-700",
  support: "bg-cyan-50 text-cyan-700",
  hr: "bg-indigo-50 text-indigo-700",
  pm: "bg-teal-50 text-teal-700",
  legal: "bg-slate-50 text-slate-700",
  education: "bg-lime-50 text-lime-700",
  data: "bg-violet-50 text-violet-700",
  product: "bg-blue-50 text-blue-700",
  media: "bg-pink-50 text-pink-700",
  translation: "bg-emerald-50 text-emerald-700",
};

export function getCategoryBadge(categoryName?: string) {
  if (!categoryName) {
    return {
      className: "bg-slate-50 text-slate-700",
      icon: "briefcase",
    };
  }

  const category = categories.find((item) => item.name === categoryName);
  return {
    className: category ? badgeStyles[category.id] || "bg-slate-50 text-slate-700" : "bg-slate-50 text-slate-700",
    icon: category?.icon || "briefcase",
  };
}
