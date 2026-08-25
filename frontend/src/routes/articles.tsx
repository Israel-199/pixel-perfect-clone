import { createFileRoute } from "@tanstack/react-router";
import { FileText, FolderTree, TrendingUp, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/articles")({
  component: ArticlesRoute,
});

const SUB_SECTIONS = [
  { icon: FileText, title: "ሁሉም ጽሑፎች", desc: "ሁሉንም መንፈሳዊ ጽሑፎች ያንብቡ" },
  { icon: FolderTree, title: "የምድብ ጽሑፎች", desc: "በተለያዩ ርዕሶች የተከፈል" },
  { icon: TrendingUp, title: "ታዋቂ ጽሑፎች", desc: "ብዙ የተነበቡ እና የተወደዱ" },
  { icon: CalendarDays, title: "የዕለት ጽሑፍ", desc: "የእለቱ ልዩ መልእክት" },
];

function ArticlesRoute() {
  return (
    <div className="animate-in fade-in pb-20">
      <div className="bg-navy-deep px-6 py-16 text-center">
        <h1 className="font-display text-4xl text-gold md:text-5xl">ጽሑፎች</h1>
        <p className="mt-4 text-sm text-on-navy-muted">
          መንፈሳዊ ጽሑፎችን አንብበው ህይወትዎን ያሳድጉ
        </p>
      </div>

      <div className="mx-auto max-w-[1180px] px-6 mt-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SUB_SECTIONS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group cursor-pointer rounded-lg bg-card p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-lg hover:border-gold/30 border border-transparent"
            >
              <div className="mb-4 inline-flex rounded-full bg-navy/5 p-4 text-navy transition-colors group-hover:bg-navy-deep group-hover:text-gold">
                <Icon className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl text-navy">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
