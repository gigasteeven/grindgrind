/**
 * Scoring formula for ChallengeGrind
 * Based on formula.md — ONLY 100% completion (no partial progress formula)
 *
 * P(h) = piecewise function of position h:
 *   1040 - 40h          for 1 ≤ h ≤ 8
 *   1200 - 60h          for 8 < h ≤ 10
 *   800 - 20h           for 10 < h ≤ 20
 *   480 - 4h            for 20 < h ≤ 50
 *   480 - 8h            for 50 < h ≤ 75
 *   155 - h             for 75 < h ≤ 150
 *   5 - 0.4*floor((h-150)/10)   for 150 < h ≤ 250
 *   1 - 0.01*floor(95(h-250)/(H-250))  for h > 250  (H = max position in list)
 */

export function calculatePoints(position, maxPosition = 250) {
  const h = position;

  if (h < 1) return 0;

  if (h >= 1 && h <= 8) {
    return Math.round((1040 - 40 * h) * 100) / 100;
  }
  if (h > 8 && h <= 10) {
    return Math.round((1200 - 60 * h) * 100) / 100;
  }
  if (h > 10 && h <= 20) {
    return Math.round((800 - 20 * h) * 100) / 100;
  }
  if (h > 20 && h <= 50) {
    return Math.round((480 - 4 * h) * 100) / 100;
  }
  if (h > 50 && h <= 75) {
    return Math.round((480 - 8 * h) * 100) / 100;
  }
  if (h > 75 && h <= 150) {
    return Math.round((155 - h) * 100) / 100;
  }
  if (h > 150 && h <= 250) {
    return Math.round((5 - 0.4 * Math.floor((h - 150) / 10)) * 100) / 100;
  }
  // Unbounded list (h > 250)
  if (maxPosition > 250) {
    return Math.round((1 - 0.01 * Math.floor((95 * (h - 250)) / (maxPosition - 250))) * 100) / 100;
  }
  return 0.5;
}

/**
 * Calculate total score for a player across all their records.
 * Only 100% completions count (per user request: ignore non-100% formula).
 */
export function calculatePlayerScore(records, challengePositions) {
  let total = 0;
  for (const record of records) {
    if (record.percent === 100) {
      const pos = challengePositions[record.challengeId];
      if (pos) {
        total += calculatePoints(pos);
      }
    }
  }
  return Math.round(total * 100) / 100;
}

/**
 * Get all players ranked by total score.
 * @param {Array} allChallenges - array of challenge objects with records
 * @returns {Array} sorted array of { username, score, records, hardest }
 */
export function getRankings(allChallenges) {
  const maxPos = allChallenges.length;
  const playerMap = {};

  // Build position map
  const positions = {};
  allChallenges.forEach((c, i) => {
    positions[c.id] = i + 1;
  });

  // Aggregate records per player
  allChallenges.forEach((challenge, index) => {
    const position = index + 1;
    const points = calculatePoints(position, maxPos);

    challenge.records.forEach((record) => {
      if (record.percent !== 100) return;

      const username = record.user;
      if (!playerMap[username]) {
        playerMap[username] = {
          username,
          score: 0,
          completions: [],
          hardest: null,
          hardestPosition: Infinity,
        };
      }

      playerMap[username].score += points;
      playerMap[username].completions.push({
        challengeId: challenge.id,
        challengeName: challenge.name,
        position,
        points,
        link: record.link,
      });

      if (position < playerMap[username].hardestPosition) {
        playerMap[username].hardestPosition = position;
        playerMap[username].hardest = challenge.name;
      }
    });
  });

  // Sort by score descending
  const rankings = Object.values(playerMap).map(p => ({
    ...p,
    score: Math.round(p.score * 100) / 100,
  }));
  rankings.sort((a, b) => b.score - a.score);

  return rankings;
}
