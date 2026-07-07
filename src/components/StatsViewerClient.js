"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

/* Country flag SVG — defaults to international flag */
function CountryFlag({ code, size = 18 }) {
  if (!code || code.length !== 2) {
    return (
      <svg width={size} height={Math.round(size * 0.75)} viewBox="0 0 24 18" className="inline-block shrink-0 rounded-sm">
        <rect width="24" height="18" rx="2" fill="#e0e0e0" stroke="#999" strokeWidth="0.5"/>
        <circle cx="12" cy="9" r="4" fill="none" stroke="#999" strokeWidth="1"/>
        <text x="12" y="12" textAnchor="middle" fontSize="5" fill="#999" fontWeight="bold">INT</text>
      </svg>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={code}
      className="rounded-sm inline-block shrink-0"
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  );
}

/* Rank badge class */
function rankClass(rank) {
  if (rank === 1) return "cg-rank-top1";
  if (rank <= 3) return "cg-rank-top3";
  if (rank <= 5) return "cg-rank-top5";
  if (rank <= 10) return "cg-rank-top10";
  return "cg-rank-default";
}

/* ── Player List Row ── */
function PlayerRow({ player, rank, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 text-left transition-all duration-150 border-l-2 ${
        selected
          ? "bg-cg-surface-2/60 border-cg-orange"
          : "border-transparent hover:bg-cg-surface-2/30"
      }`}
    >
      <span className={`cg-rank w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-xs ${rankClass(rank)}`}>
        {rank}
      </span>
      <span className="flex-1 min-w-0">
        <span className="text-xs sm:text-sm font-medium text-cg-white truncate block">
          {player.username}
        </span>
        <span className="text-[10px] sm:text-xs text-cg-white-dim">
          {player.completions.length} completions
        </span>
      </span>
      <CountryFlag code={player.country} size={16} />
      <span className="text-xs sm:text-sm font-bold text-cg-yellow shrink-0">
        {player.score}
      </span>
    </button>
  );
}

/* ── Detail Panel ── */
function PlayerDetail({ player, rank, challenges }) {
  if (!player) {
    return (
      <div className="cg-card h-full flex items-center justify-center p-8">
        <p className="text-cg-white-dim text-sm">Select a player to view details</p>
      </div>
    );
  }

  const top5 = player.completions.filter(c => c.position <= 5).length;
  const top15 = player.completions.filter(c => c.position <= 15 && c.position > 5).length;
  const rest = player.completions.filter(c => c.position > 15).length;
  const verified = challenges.filter(c => c.verifier === player.username);

  return (
    <div className="cg-card h-full overflow-y-auto" style={{ maxHeight: "calc(100vh - 8rem)" }}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-cg-border">
        <div className="flex items-center gap-3">
          <CountryFlag code={player.country} size={32} />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-cg-white truncate">{player.username}</h2>
            <p className="text-xs text-cg-white-dim mt-0.5">
              {player.country ? `${player.country.toUpperCase()} · ` : ""}{player.completions.length} completions
            </p>
          </div>
        </div>
      </div>

      {/* Rank & Score */}
      <div className="grid grid-cols-2 gap-px" style={{ backgroundColor: "var(--cg-border)" }}>
        <div className="bg-cg-surface p-4">
          <p className="text-[10px] text-cg-white-dim uppercase tracking-wider mb-1">Rank</p>
          <p className="text-2xl font-bold text-cg-white">#{rank}</p>
        </div>
        <div className="bg-cg-surface p-4">
          <p className="text-[10px] text-cg-white-dim uppercase tracking-wider mb-1">Score</p>
          <p className="text-2xl font-bold text-cg-yellow">{player.score}</p>
        </div>
      </div>

      {/* Stats breakdown */}
      <div className="p-4 sm:p-5 border-b border-cg-border">
        <h3 className="text-[10px] font-semibold text-cg-orange uppercase tracking-wider mb-2">ChallengeGrind Stats</h3>
        <p className="text-sm text-cg-white-dim">
          <span className="text-cg-white">{top5}</span> Top 5, <span className="text-cg-white">{top15}</span> Top 15, <span className="text-cg-white">{rest}</span> Extended
        </p>
      </div>

      {/* Hardest */}
      <div className="p-4 sm:p-5 border-b border-cg-border">
        <h3 className="text-[10px] font-semibold text-cg-orange uppercase tracking-wider mb-2">Hardest Challenge</h3>
        {player.hardest ? (
          <Link
            href={`/level/challenge/${player.completions.find(c => c.challengeName === player.hardest)?.challengeId}`}
            className="text-sm font-medium text-cg-white hover:text-cg-orange transition-colors"
          >
            #{player.hardestPosition} {player.hardest}
          </Link>
        ) : (
          <p className="text-sm text-cg-white-dim">None</p>
        )}
      </div>

      {/* Completed */}
      <div className="p-4 sm:p-5 border-b border-cg-border">
        <h3 className="text-[10px] font-semibold text-cg-orange uppercase tracking-wider mb-2">
          Challenges Completed ({player.completions.length})
        </h3>
        {player.completions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {player.completions
              .sort((a, b) => a.position - b.position)
              .map((c, idx) => (
                <Link
                  key={idx}
                  href={`/level/challenge/${c.challengeId}`}
                  className="cg-badge bg-cg-surface-2 border border-cg-border text-cg-white-dim hover:border-cg-orange/40 hover:text-cg-white transition-colors"
                >
                  #{c.position} {c.challengeName}
                </Link>
              ))}
          </div>
        ) : (
          <p className="text-sm text-cg-white-dim">None</p>
        )}
      </div>

      {/* Verified */}
      <div className="p-4 sm:p-5 border-b border-cg-border">
        <h3 className="text-[10px] font-semibold text-cg-orange uppercase tracking-wider mb-2">
          Challenges Verified ({verified.length})
        </h3>
        {verified.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {verified.map((c, idx) => (
              <Link
                key={idx}
                href={`/level/challenge/${c.id}`}
                className="cg-badge bg-cg-surface-2 border border-cg-border text-cg-white-dim hover:border-cg-orange/40 hover:text-cg-white transition-colors"
              >
                #{c.position} {c.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-cg-white-dim">None</p>
        )}
      </div>

      {/* Created */}
      <div className="p-4 sm:p-5 border-b border-cg-border">
        <h3 className="text-[10px] font-semibold text-cg-orange uppercase tracking-wider mb-2">
          Challenges Created ({player.created?.length || 0})
        </h3>
        {player.created?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {player.created.map((c, idx) => (
              <Link
                key={idx}
                href={`/level/challenge/${c.challengeId}`}
                className="cg-badge bg-cg-surface-2 border border-cg-border text-cg-white-dim hover:border-cg-orange/40 hover:text-cg-white transition-colors"
              >
                #{c.position} {c.challengeName}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-cg-white-dim">None</p>
        )}
      </div>

      {/* Published */}
      <div className="p-4 sm:p-5 border-b border-cg-border">
        <h3 className="text-[10px] font-semibold text-cg-orange uppercase tracking-wider mb-2">
          Challenges Published ({player.published?.length || 0})
        </h3>
        {player.published?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {player.published.map((c, idx) => (
              <Link
                key={idx}
                href={`/level/challenge/${c.challengeId}`}
                className="cg-badge bg-cg-surface-2 border border-cg-border text-cg-white-dim hover:border-cg-orange/40 hover:text-cg-white transition-colors"
              >
                #{c.position} {c.challengeName}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-cg-white-dim">None</p>
        )}
      </div>

      {/* Created / Published */}
      <div className="grid grid-cols-2 gap-px" style={{ backgroundColor: "var(--cg-border)" }}>
        <div className="bg-cg-surface p-4">
          <h3 className="text-[10px] font-semibold text-cg-orange uppercase tracking-wider mb-1">Created</h3>
          {player.created?.length > 0 ? (
            <p className="text-sm text-cg-white">{player.created.length}</p>
          ) : (
            <p className="text-sm text-cg-white-dim">None</p>
          )}
        </div>
        <div className="bg-cg-surface p-4">
          <h3 className="text-[10px] font-semibold text-cg-orange uppercase tracking-wider mb-1">Published</h3>
          {player.published?.length > 0 ? (
            <p className="text-sm text-cg-white">{player.published.length}</p>
          ) : (
            <p className="text-sm text-cg-white-dim">None</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StatsViewerClient({ rankings, challenges }) {
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [page, setPage] = useState(0);
  const perPage = 25;

  const filtered = useMemo(() => {
    if (!search) return rankings;
    const q = search.toLowerCase();
    return rankings.filter(r => r.username.toLowerCase().includes(q));
  }, [search, rankings]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageData = filtered.slice(page * perPage, (page + 1) * perPage);
  const selectedPlayer = filtered[selectedIdx];
  const selectedRank = selectedIdx + 1;

  useEffect(() => {
    setSelectedIdx(0);
    setPage(0);
  }, [search]);

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="cg-section-title text-cg-white">Stats Viewer</h1>
        <p className="mt-1 text-sm text-cg-white-dim">
          {rankings.length} players ranked by ChallengeGrind score
        </p>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-3 sm:gap-4">
        {/* Left: Player list */}
        <div className="cg-card overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-cg-border">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cg-white-dim/40"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search player..."
                className="cg-input pl-9 py-2 text-sm"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-[50vh] lg:max-h-[calc(100vh-16rem)] overflow-y-auto">
            {pageData.length > 0 ? (
              pageData.map((player, idx) => {
                const actualIdx = page * perPage + idx;
                const actualRank = actualIdx + 1;
                return (
                  <PlayerRow
                    key={player.username}
                    player={player}
                    rank={actualRank}
                    selected={selectedIdx === actualIdx}
                    onClick={() => setSelectedIdx(actualIdx)}
                  />
                );
              })
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-cg-white-dim">No players found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t border-cg-border">
              <button
                onClick={() => { setPage(Math.max(0, page - 1)); setSelectedIdx(page * perPage); }}
                disabled={page === 0}
                className="cg-btn cg-btn-ghost text-xs px-3 py-1.5 disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="text-xs text-cg-white-dim">{page + 1} / {totalPages}</span>
              <button
                onClick={() => { setPage(Math.min(totalPages - 1, page + 1)); setSelectedIdx((page + 1) * perPage); }}
                disabled={page >= totalPages - 1}
                className="cg-btn cg-btn-ghost text-xs px-3 py-1.5 disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Right: Detail panel */}
        <div className="lg:block">
          <PlayerDetail player={selectedPlayer} rank={selectedRank} challenges={challenges} />
        </div>
      </div>
    </div>
  );
}
