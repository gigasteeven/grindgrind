import Link from "next/link";
import { getChangelog } from "@/lib/redis";
import RecentChanges from "@/components/RecentChanges";

export const runtime = "edge";
export const revalidate = 60;

export default async function HomePage() {
  const changelogEntries = await getChangelog(30);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-20 sm:py-28 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
            <span className="text-cg-white">Challenge</span>
            <span
              style={{
                backgroundImage: "linear-gradient(to right, var(--cg-accent-from), var(--cg-accent-to))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Grind
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-cg-white-dim max-w-2xl mx-auto">
            The definitive Geometry Dash Challenge List. Compete, verify, and climb the ranks.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/list/challenge" className="cg-btn cg-btn-primary text-base px-6 py-3">
              View Challenge List
            </Link>
            <Link href="/stats" className="cg-btn cg-btn-ghost text-base px-6 py-3">
              Stats Viewer
            </Link>
          </div>
        </div>
      </section>
      {/* Recent Changes */}
      {changelogEntries && changelogEntries.length > 0 && (
        <section className="pb-16 sm:pb-20 px-0 sm:px-4">
          <RecentChanges initialEntries={changelogEntries} />
        </section>
      )}
    </div>
  );
}
