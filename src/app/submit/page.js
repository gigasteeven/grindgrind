"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubmitRecordsPage() {
  const [listType, setListType] = useState("challenge");
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [rawFootage, setRawFootage] = useState("");
  const [time, setTime] = useState(""); // platformer only
  const [percent, setPercent] = useState("100");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      setIsLoggedIn(true);
      const userData = JSON.parse(user);
      setPlayerName(userData.username);
      setCountry(userData.country || "");
    }
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await fetch(`/api/list?type=challenge`);
      const data = await res.json();
      setChallenges(data.challenges || []);
    } catch {
      // silent
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to submit records.");
      setLoading(false);
      return;
    }

    try {
      const body = {
        challengeId: selectedChallenge,
        playerName,
        videoLink,
        rawFootage: rawFootage || undefined, // optional
        percent: parseInt(percent),
        country,
        listType,
        time: listType === "platformer" ? time : undefined,
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess("Record submitted! Staff will review it shortly.");
        setVideoLink("");
        setRawFootage("");
        setTime("");
      }
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <h1 className="cg-section-title text-cg-white mb-2">Submit Records</h1>
      <p className="text-cg-white-dim mb-8">
        Submit your completion. Staff will verify it before it appears on the list.
      </p>

      {!isLoggedIn && (
        <div className="cg-card mb-6 border-cg-orange/30">
          <p className="text-sm text-cg-white">
            ⚠️ You need to be <a href="/auth/signup" className="text-cg-orange underline">logged in</a> to submit records.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="cg-card space-y-5">
        {/* List type toggle */}
        <div>
          <label className="block text-xs font-medium text-cg-white-dim mb-1.5">List Type</label>
          <div className="flex gap-2 p-1 rounded-lg bg-cg-brown">
            <button
              type="button"
              onClick={() => setListType("challenge")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                listType === "challenge" ? "bg-cg-orange text-cg-black" : "text-cg-white-dim"
              }`}
            >
              Challenge
            </button>
            <button
              type="button"
              onClick={() => setListType("platformer")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                listType === "platformer" ? "bg-cg-orange text-cg-black" : "text-cg-white-dim"
              }`}
            >
              Platformer
            </button>
          </div>
        </div>

        {/* Challenge selector */}
        <div>
          <label className="block text-xs font-medium text-cg-white-dim mb-1.5">Select Challenge</label>
          <select
            value={selectedChallenge}
            onChange={(e) => setSelectedChallenge(e.target.value)}
            className="cg-input"
            required
          >
            <option value="">— Choose a level —</option>
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.position} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Player name */}
        <div>
          <label className="block text-xs font-medium text-cg-white-dim mb-1.5">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="cg-input"
            required
          />
        </div>

        {/* Video link */}
        <div>
          <label className="block text-xs font-medium text-cg-white-dim mb-1.5">Video Proof *</label>
          <input
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            className="cg-input"
            placeholder="https://youtu.be/..."
            required
          />
        </div>

        {/* Raw footage (optional) */}
        <div>
          <label className="block text-xs font-medium text-cg-white-dim mb-1.5">
            Raw Footage <span className="text-cg-white-dim/50">(optional)</span>
          </label>
          <input
            type="url"
            value={rawFootage}
            onChange={(e) => setRawFootage(e.target.value)}
            className="cg-input"
            placeholder="https://youtu.be/... (unlisted raw footage)"
          />
          <p className="text-xs text-cg-white-dim/50 mt-1">Raw footage is optional but helps with verification.</p>
        </div>

        {/* Platformer time */}
        {listType === "platformer" && (
          <div>
            <label className="block text-xs font-medium text-cg-white-dim mb-1.5">Completion Time</label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="cg-input"
              placeholder="e.g. 1:23.456"
              required
            />
          </div>
        )}

        {/* Percent */}
        <div>
          <label className="block text-xs font-medium text-cg-white-dim mb-1.5">Percent (%)</label>
          <input
            type="number"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="cg-input"
            min="1"
            max="100"
            required
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-medium text-cg-white-dim mb-1.5">Country (optional)</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
            className="cg-input"
            placeholder="2-letter code"
            maxLength={2}
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isLoggedIn}
          className="cg-btn cg-btn-primary w-full text-base py-3 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Record"}
        </button>
      </form>
    </div>
  );
}
