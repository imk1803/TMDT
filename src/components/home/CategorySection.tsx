import { Briefcase, Megaphone, Palette, Users, WalletMinimal, LineChart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { categories } from "@/data/categories";

const iconMap = {
  code: <Briefcase className="h-5 w-5" />,
  design: <Palette className="h-5 w-5" />,
  megaphone: <Megaphone className="h-5 w-5" />,
  wallet: <WalletMinimal className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  chart: <LineChart className="h-5 w-5" />,
} as const;

export function CategorySection() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <Container>
        <SectionTitle
          title="Danh mục ngành nghề nổi bật"
          subtitle="Khám phá cơ hội việc làm theo lĩnh vực bạn quan tâm."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group flex cursor-pointer flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-xs shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:shadow-md sm:p-4 sm:text-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-sky-500 shadow-sm shadow-sky-50 group-hover:bg-gradient-to-tr group-hover:from-sky-500 group-hover:to-teal-400 group-hover:text-white">
                {iconMap[category.icon as keyof typeof iconMap]}
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-800">
                  {category.name}
                </p>
                <p className="text-[11px] text-slate-500 sm:text-xs">
                  {category.jobsCount.toLocaleString("vi-VN")} việc làm
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

