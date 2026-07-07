import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-20 sm:py-28 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
            <span className="text-cg-white">Challenge</span>
            <span className="bg-gradient-to-r from-cg-orange via-cg-orange-bright to-cg-yellow bg-clip-text text-transparent">
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
    </div>
  );
}
