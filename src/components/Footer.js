export default function Footer() {
  return (
    <footer className="border-t border-cg-border bg-cg-dark-brown mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/ico.png" alt="ChallengeGrind" className="w-7 h-7 rounded" />
            <span className="text-base font-extrabold">
              <span className="text-cg-white">Challenge</span>
              <span className="bg-gradient-to-r from-cg-orange to-cg-yellow bg-clip-text text-transparent">
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
