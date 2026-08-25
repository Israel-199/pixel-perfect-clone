import { createFileRoute } from "@tanstack/react-router";
import { Video, Headphones, Mic, Sparkles, Radio } from "lucide-react";

export const Route = createFileRoute("/media")({
  component: MediaRoute,
});

const SUB_SECTIONS = [
  { icon: Video, title: "ቪዲዮዎች", desc: "የቪዲዮ ትምህርቶች እና መዝሙሮች" },
  { icon: Headphones, title: "ኦዲዮዎች", desc: "የድምፅ ትምህርቶች" },
  { icon: Mic, title: "ፖድካስት", desc: "መንፈሳዊ ውይይቶች" },
  { icon: Sparkles, title: "ልዩ መርሀ ግብር", desc: "የተለዩ ወቅታዊ መልእክቶች" },
  { icon: Radio, title: "LIVE", desc: "የቀጥታ ስርጭት ፕሮግራሞች" },
];

function MediaRoute() {
  return (
    <div className="animate-in fade-in pb-20">
      <div className="bg-navy-deep px-6 py-16 text-center">
        <h1 className="font-display text-4xl text-gold md:text-5xl">MEDIA</h1>
        <p className="mt-4 text-sm text-on-navy-muted">
          ቪዲዮዎች፣ አዲዮዎች እና የቀጥታ ስርጭት
        </p>
      </div>

      <div className="mx-auto max-w-[1180px] px-6 mt-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
