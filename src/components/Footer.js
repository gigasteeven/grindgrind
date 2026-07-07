export default function Footer() {
  return (
    <footer className="border-t border-cg-border mt-20" style={{ backgroundColor: "var(--cg-surface)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/ico.png" alt="ChallengeGrind" className="w-7 h-7 rounded" />
            <span className="text-base font-extrabold">
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
            </span>
          </div>
          <p className="text-sm text-cg-white-dim">
            © 2026 ChallengeGrind. Geometry Dash Challenge List.
          </p>
        </div>
      </div>
    </footer>
  );
}
