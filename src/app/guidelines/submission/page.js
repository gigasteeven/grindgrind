import { getContent, KEYS } from "@/lib/redis";

export const dynamic = "force-dynamic";

export default async function LevelSubmissionPage() {
  let guidelines = await getContent(KEYS.submission);
  if (!guidelines) {
    guidelines = [
      "Levels must be original creations, not copies of existing levels.",
      "Levels must have a verifier with video proof of 100% completion.",
      "Levels must be challenging enough to qualify for the list.",
      "Submission must include level ID, name, author, and verification video.",
      "Staff will review submissions and decide placement on the list.",
      "Levels that are nerfed or updated may be re-evaluated.",
    ];
  }
  if (typeof guidelines === "string") {
    try { guidelines = JSON.parse(guidelines); } catch { guidelines = [guidelines]; }
  }

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 py-6 sm:py-8">
      <h1 className="cg-section-title text-cg-white mb-2">Level Submission</h1>
      <p className="text-cg-white-dim mb-6 text-sm">Requirements for getting a challenge added to the list.</p>

      <div className="cg-card p-5">
        <ol className="space-y-4">
          {guidelines.map((rule, idx) => (
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
