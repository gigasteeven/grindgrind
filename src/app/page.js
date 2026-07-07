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

      {/* Feature cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-20">
        <Link href="/list/challenge" className="cg-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cg-orange/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-cg-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5 5 0 006 0l3-9m-6 1l3-9a5 5 0 006 0l3 9m-6-1l3 1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-cg-white">Challenge List</h3>
          </div>
          <p className="text-sm text-cg-white-dim">Browse the toughest challenges ranked by difficulty. Submit your records and climb.</p>
        </Link>

        <Link href="/stats" className="cg-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cg-orange/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-cg-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-cg-white">Stats Viewer</h3>
          </div>
          <p className="text-sm text-cg-white-dim">See player rankings, total scores, and hardest completions. Compete for the top.</p>
        </Link>

        <Link href="/submit" className="cg-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cg-orange/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-cg-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-cg-white">Submit Records</h3>
          </div>
          <p className="text-sm text-cg-white-dim">Got a completion? Submit your record with video proof. Staff will verify it.</p>
        </Link>
      </section>
    </div>
  );
}
