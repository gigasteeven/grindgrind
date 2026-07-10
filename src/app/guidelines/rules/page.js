import { getContent, KEYS } from "@/lib/redis";

export const runtime = "edge";
export const revalidate = 60; // Cache for 5 minutes

export default async function RulesPage() {
  let rules = await getContent(KEYS.rules);
  if (!rules) {
    rules = [
      "Records must be achieved on the official version of the level.",
      "Video proof is required for all records on the Main List.",
      "Raw footage may be requested by staff for verification.",
      "Cheating, macro usage, or speedhack will result in a permanent ban.",
      "Players must use legitimate copy of the level (no hacks).",
      "Records must be submitted through the Submit Records page.",
      "Staff reserves the right to reject any record without explanation.",
    ];
  }
  if (typeof rules === "string") {
    try { rules = JSON.parse(rules); } catch { rules = [rules]; }
  }

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 py-6 sm:py-8">
      <h1 className="cg-section-title text-cg-white mb-2">Rules</h1>
      <p className="text-cg-white-dim mb-6 text-sm">Follow these rules to keep the list fair and legitimate.</p>

      <div className="cg-card p-5">
        <ol className="space-y-4">
          {rules.map((rule, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-cg-orange/10 border border-cg-orange/30 flex items-center justify-center text-sm font-bold text-cg-orange">
                {idx + 1}
              </span>
              <p className="text-sm text-cg-white leading-relaxed pt-0.5">{rule}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
