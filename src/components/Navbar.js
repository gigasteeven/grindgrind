"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeSwitcher from "./ThemeSwitcher";

/* ── Admin shield icon (CS2 Prime style) ── */
function AdminShield({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="inline-block shrink-0"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cg-accent-from, #ff6b1a)" />
          <stop offset="100%" stopColor="var(--cg-accent-to, #ffb627)" />
        </linearGradient>
      </defs>
      {/* Shield outline */}
      <path
        d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"
        fill="url(#shieldGrad)"
        fillOpacity="0.15"
        stroke="url(#shieldGrad)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Checkmark inside */}
      <path
        d="M8.5 12l2.5 2.5L16 9.5"
        stroke="url(#shieldGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Auth hook — fetches real user data from server, refreshes on route change ── */
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Re-fetch on mount, on every route change, AND on custom auth-change event
  useEffect(() => {
    fetchMe();
  }, [pathname, fetchMe]);

  // Listen for auth-change event (dispatched after registration/login)
  useEffect(() => {
    const handler = () => fetchMe();
    window.addEventListener("auth-change", handler);
    return () => window.removeEventListener("auth-change", handler);
  }, [fetchMe]);

  return { user, loading, refresh: fetchMe };
}

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
        <div className="absolute left-0 top-full z-50 min-w-[180px] animate-slide-down rounded-lg border-2 border-cg-border bg-cg-surface py-1.5 shadow-xl shadow-black/50">
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
function MobileMenu({ user, loading, onLogout }) {
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
        className="flex items-center justify-center w-10 h-10 rounded-md border-2 border-cg-border text-cg-white-dim md:hidden"
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
        <div className="absolute top-full left-0 right-0 z-50 animate-slide-down border-b-2 border-cg-border bg-cg-surface md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
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
            <div className="pt-2 border-t-2 border-cg-border space-y-2">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-cg-orange">Theme</span>
                <ThemeSwitcher />
              </div>
              <Link href="/stats" className="block py-1.5 text-sm font-medium text-cg-white" onClick={() => setOpen(false)}>
                Stats Viewer
              </Link>
              <Link href="/submit" className="block py-1.5 text-sm font-medium text-cg-white" onClick={() => setOpen(false)}>
                Submit Records
              </Link>
              {!loading && user ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2 py-1.5 text-sm font-medium text-cg-white" onClick={() => setOpen(false)}>
                    <span className="truncate">{user.username}</span>
                    {user.isAdmin && <AdminShield size={16} />}
                  </Link>
                  {user.isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2 py-1.5 text-sm font-medium text-cg-orange" onClick={() => setOpen(false)}>
                      <AdminShield size={16} />
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { onLogout(); setOpen(false); }} className="block py-1.5 text-sm font-medium text-red-400">
                    Logout
                  </button>
                </>
              ) : !loading ? (
                <Link href="/auth/signup" className="block py-2 text-sm font-semibold text-cg-orange" onClick={() => setOpen(false)}>
                  Sign Up
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Navbar() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    refresh();
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b-2 border-cg-border backdrop-blur-md" style={{ backgroundColor: "color-mix(in srgb, var(--cg-bg) 92%, transparent)" }}>
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
            <ThemeSwitcher />

            {/* Account icon — always visible, goes to profile or signup */}
            {!loading ? (
              user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-cg-border transition-all duration-200 hover:border-cg-orange/40"
                  title={user.username}
                  aria-label="Profile"
                >
                  <svg className="w-5 h-5 text-cg-white-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs text-cg-white-dim hidden lg:inline max-w-[100px] truncate">{user.username}</span>
                  {user.isAdmin && <AdminShield size={16} />}
                </Link>
              ) : (
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center w-9 h-9 rounded-md border border-cg-border text-cg-white-dim transition-all duration-200 hover:border-cg-orange/40"
                  title="Sign Up"
                  aria-label="Sign Up"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )
            ) : null}

            {/* Desktop: logout button for logged in users */}
            {!loading && user ? (
              <button onClick={handleLogout} className="cg-btn px-3 py-2 text-sm border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-200 hidden sm:inline-flex">
                Logout
              </button>
            ) : null}
            <MobileMenu user={user} loading={loading} onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </nav>
  );
}
