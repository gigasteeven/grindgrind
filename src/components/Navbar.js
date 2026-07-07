"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeSwitcher from "./ThemeSwitcher";

/* ── Dropdown item ── */
function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const pathname = usePathname();

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-cg-white-dim transition-colors duration-200 hover:text-cg-white"
        aria-expanded={open}
      >
        {label}
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 min-w-[180px] animate-slide-down rounded-lg border border-cg-border bg-cg-surface py-1.5 shadow-xl shadow-black/50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 text-sm transition-colors duration-150 ${
                pathname === item.href
                  ? "text-cg-orange bg-cg-surface-2"
                  : "text-cg-white-dim hover:text-cg-white hover:bg-cg-surface-2/50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Mobile menu ── */
function MobileMenu({ isLoggedIn, username, isAdmin, onLogout }) {
  const [open, setOpen] = useState(false);

  const sections = [
    {
      title: "List",
      items: [
        { label: "Challenge List", href: "/list/challenge" },
        { label: "Platformer List", href: "/list/platformer" },
      ],
    },
    {
      title: "Guidelines",
      items: [
        { label: "Rules", href: "/guidelines/rules" },
        { label: "Level Submission", href: "/guidelines/submission" },
      ],
    },
    {
      title: "Other",
      items: [
        { label: "Staff", href: "/other/staff" },
        { label: "Social Media", href: "/other/social" },
      ],
    },
  ];

  return (
    <>
      <button
        className="flex items-center justify-center w-10 h-10 rounded-md border border-cg-border text-cg-white-dim md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 animate-slide-down border-b border-cg-border bg-cg-surface md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-cg-orange mb-2">
                  {section.title}
                </p>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-1.5 text-sm text-cg-white-dim hover:text-cg-white"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-2 border-t border-cg-border space-y-2">
              <Link href="/stats" className="block py-1.5 text-sm font-medium text-cg-white" onClick={() => setOpen(false)}>
                Stats Viewer
              </Link>
              <Link href="/submit" className="block py-1.5 text-sm font-medium text-cg-white" onClick={() => setOpen(false)}>
                Submit Records
              </Link>
              {isLoggedIn ? (
                <>
                  <Link href="/profile" className="block py-1.5 text-sm font-medium text-cg-white" onClick={() => setOpen(false)}>
                    Profile ({username})
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="block py-1.5 text-sm font-medium text-cg-orange" onClick={() => setOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { onLogout(); setOpen(false); }} className="block py-1.5 text-sm font-medium text-red-400">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/auth/signup" className="block py-2 text-sm font-semibold text-cg-orange" onClick={() => setOpen(false)}>
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (token && user) {
        const userData = JSON.parse(user);
        setIsLoggedIn(true);
        setUsername(userData.username);
        setIsAdmin(userData.isAdmin || false);
      } else {
        setIsLoggedIn(false);
        setUsername("");
        setIsAdmin(false);
      }
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUsername("");
    setIsAdmin(false);
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-cg-border backdrop-blur-md" style={{ backgroundColor: "color-mix(in srgb, var(--cg-bg) 92%, transparent)" }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/ico.png" alt="ChallengeGrind" className="w-8 h-8 rounded" />
            <span className="text-lg font-extrabold tracking-tight hidden sm:block">
              <span className="text-cg-white">Challenge</span>
              <span style={{ backgroundImage: `linear-gradient(to right, var(--cg-accent-from), var(--cg-accent-to))`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Grind
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavDropdown label="List" items={[
              { label: "Challenge List", href: "/list/challenge" },
              { label: "Platformer List", href: "/list/platformer" },
            ]} />
            <NavDropdown label="Guidelines" items={[
              { label: "Rules", href: "/guidelines/rules" },
              { label: "Level Submission", href: "/guidelines/submission" },
            ]} />
            <NavDropdown label="Other" items={[
              { label: "Staff", href: "/other/staff" },
              { label: "Social Media", href: "/other/social" },
            ]} />
            <Link href="/stats" className="px-3 py-2 text-sm font-medium text-cg-white-dim transition-colors duration-200 hover:text-cg-white">
              Stats Viewer
            </Link>
            <Link href="/submit" className="px-3 py-2 text-sm font-medium text-cg-white-dim transition-colors duration-200 hover:text-cg-white">
              Submit Records
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/profile" className="px-3 py-2 text-sm font-medium text-cg-white-dim transition-colors duration-200 hover:text-cg-white">
                  {username}
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="cg-btn cg-btn-ghost text-sm">Admin</Link>
                )}
                <button onClick={handleLogout} className="cg-btn px-3 py-2 text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-200">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/auth/signup" className="cg-btn cg-btn-primary hidden sm:inline-flex">Sign Up</Link>
            )}
            <MobileMenu isLoggedIn={isLoggedIn} username={username} isAdmin={isAdmin} onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </nav>
  );
}
