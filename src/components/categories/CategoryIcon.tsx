import {
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  Code2,
  Database,
  Globe,
  Headphones,
  Megaphone,
  Palette,
  PenLine,
  Scale,
  TrendingUp,
  Users,
  Video,
  Wallet,
  Layers,
} from "lucide-react";

const iconMap: Record<string, typeof Code2> = {
  code: Code2,
  design: Palette,
  megaphone: Megaphone,
  pen: PenLine,
  wallet: Wallet,
  chart: TrendingUp,
  headset: Headphones,
  users: Users,
  clipboard: ClipboardList,
  scale: Scale,
  book: BookOpen,
  database: Database,
  layers: Layers,
  video: Video,
  globe: Globe,
  briefcase: BriefcaseBusiness,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] || BriefcaseBusiness;
  return <Icon className={className || "h-4 w-4"} />;
}
