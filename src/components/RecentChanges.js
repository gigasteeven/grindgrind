"use client";

import { useState, useEffect } from "react";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (entryDate.getTime() === today.getTime()) return "Сегодня";
  if (entryDate.getTime() === yesterday.getTime()) return "Вчера";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).replace(" г.", " г.");
}

function groupByDate(entries) {
  const groups = {};
  for (const entry of entries) {
    const label = formatDate(entry.timestamp);
    if (!groups[label]) groups[label] = [];
    groups[label].push(entry);
  }
  return Object.entries(groups);
}

/* ── Icons ── */
function RaisedIcon() {
  return (
    <span className="cg-changelog-icon cg-changelog-raised" title="Raised">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 2L12 9H2L7 2Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function LoweredIcon() {
  return (
    <span className="cg-changelog-icon cg-changelog-lowered" title="Lowered">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 12L2 5H12L7 12Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function AddedIcon() {
  return (
    <span className="cg-changelog-icon cg-changelog-added" title="Added">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function ChangelogEntry({ entry }) {
  const { type, challengeName, oldPos, newPos, aboveName, belowName } = entry;

  return (
    <div className="cg-changelog-entry">
      <div className="cg-changelog-entry-icon">
        {type === "raised" && <RaisedIcon />}
        {type === "lowered" && <LoweredIcon />}
        {type === "added" && <AddedIcon />}
      </div>
      <div className="cg-changelog-entry-content">
        <span className="cg-changelog-name">{challengeName}</span>
        {" "}
        {type === "added" ? (
          <>
            <span className="cg-changelog-detail">добавлен на</span>
            {" "}
            <span className="cg-changelog-pos">#{newPos}</span>
          </>
        ) : (
          <>
            <span className="cg-changelog-pos">#{oldPos}</span>
            <span className="cg-changelog-detail"> → </span>
            <span className="cg-changelog-pos">#{newPos}</span>
          </>
        )}
        {aboveName && (
          <>
            <span className="cg-changelog-detail">, выше</span>
            {" "}
            <span className="cg-changelog-neighbor">{aboveName}</span>
          </>
        )}
        {belowName && (
          <>
            <span className="cg-changelog-detail">, ниже</span>
            {" "}
            <span className="cg-changelog-neighbor">{belowName}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function RecentChanges({ initialEntries }) {
  const [entries, setEntries] = useState(initialEntries || []);
  const [expanded, setExpanded] = useState(false);

  // If no initial entries were passed (client-side fallback), fetch them
  useEffect(() => {
    if (!initialEntries || initialEntries.length === 0) {
      fetch("/api/changelog")
        .then(r => r.json())
        .then(data => setEntries(data.entries || []))
        .catch(() => {});
    }
  }, []);

  if (entries.length === 0) return null;

  const grouped = groupByDate(entries);
  const visibleGroups = expanded ? grouped : grouped.slice(0, 2);
  const hasMore = grouped.length > 2;

  return (
    <section className="cg-changelog-section">
      {/* Header */}
      <div className="cg-changelog-header">
        <div className="cg-changelog-header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="cg-changelog-title">Последние изменения</h2>
      </div>

      {/* Groups */}
      <div className="cg-changelog-groups">
        {visibleGroups.map(([dateLabel, items], gi) => (
          <div key={dateLabel} className="cg-changelog-group">
            <div className="cg-changelog-date">
              <span>{dateLabel}</span>
            </div>
            <div className="cg-changelog-entries">
              {items.map((entry, ei) => (
                <ChangelogEntry key={`${gi}-${ei}`} entry={entry} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Show more / less */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="cg-changelog-toggle"
        >
          {expanded ? "Скрыть" : `Показать ещё (${grouped.length - 2})`}
        </button>
      )}
    </section>
  );
}
