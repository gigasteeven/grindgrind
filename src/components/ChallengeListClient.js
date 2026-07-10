"use client";

import { useState, useMemo, useEffect } from "react";
import ChallengeCard from "@/components/ChallengeCard";

export default function ChallengeListClient({ challenges }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Detect screen size for pagination
  useEffect(() => {
    const updatePerPage = () => {
      setPerPage(window.innerWidth >= 768 ? 50 : 10);
    };
    updatePerPage();
    window.addEventListener("resize", updatePerPage);
    return () => window.removeEventListener("resize", updatePerPage);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return challenges;
    const q = search.toLowerCase();
    return challenges.filter(
      ({ challenge }) =>
        challenge.name?.toLowerCase().includes(q) ||
        challenge.author?.toLowerCase().includes(q) ||
        challenge.verifier?.toLowerCase().includes(q)
    );
  }, [search, challenges]);

  // Reset page when search or perPage changes
  useEffect(() => {
    setPage(0);
  }, [search, perPage]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageData = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="cg-section-title text-cg-white">Challenge List</h1>
        <p className="mt-2 text-sm text-cg-white-dim">
          {filtered.length} {filtered.length === 1 ? "challenge" : "challenges"} ranked by difficulty.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4 sm:mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cg-white-dim pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, author, or verifier..."
          className="cg-input pl-10 pr-9 w-full"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cg-white-dim hover:text-cg-white"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2 sm:space-y-3">
        {pageData.length > 0 ? (
          pageData.map(({ challenge, position, points }) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              position={position}
              points={points}
              type="challenge"
            />
          ))
        ) : (
          <div className="cg-card p-8 text-center">
            <p className="text-cg-white-dim text-sm">No challenges found matching "{search}"</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 sm:mt-8">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="cg-btn cg-btn-ghost text-sm px-4 py-2 disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-sm text-cg-white-dim">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="cg-btn cg-btn-ghost text-sm px-4 py-2 disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
