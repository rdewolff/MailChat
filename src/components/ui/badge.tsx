import { cn } from "@/lib/utils";

const categoryStyles: Record<string, string> = {
  PERSONAL: "bg-teal-100 text-teal-800",
  WORK: "bg-blue-100 text-blue-800",
  NEWSLETTER: "bg-zinc-200 text-zinc-700",
  ANNOUNCEMENT: "bg-indigo-100 text-indigo-800",
  PROMOTION: "bg-amber-100 text-amber-800",
  NOTIFICATION: "bg-orange-100 text-orange-800",
  SYSTEM: "bg-red-100 text-red-800",
  SPAM_RISK: "bg-rose-100 text-rose-800",
};

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide",
        categoryStyles[category] ?? "bg-zinc-200 text-zinc-700",
        className,
      )}
    >
      {category.replace("_", " ")}
    </span>
  );
}
