"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ── Admin login form ── */
function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captchaToken: "dev_skip" }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (!data.user.isAdmin) {
        setError("You do not have admin access.");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data);
      }
    } catch {
      setError("Login failed.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="cg-card">
        <h1 className="text-xl font-bold text-cg-white mb-2">Admin Panel</h1>
        <p className="text-sm text-cg-white-dim mb-6">Login with your admin credentials.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="cg-input"
            placeholder="Admin username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="cg-input"
            placeholder="Password"
            required
          />
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}
          <button type="submit" className="cg-btn cg-btn-primary w-full py-3">
            Login to Admin Panel
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Tab content components ── */
function ChallengesTab({ token, log }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const fetchChallenges = async () => {
    const res = await fetch("/api/admin/challenges", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setChallenges(data.challenges || []);
    setLoading(false);
  };

  useEffect(() => { fetchChallenges(); }, []);

  const movePosition = async (id, direction) => {
    const res = await fetch("/api/admin/challenges/move", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, direction }),
    });
    if (res.ok) {
      log("Moved challenge position", { id, direction });
      fetchChallenges();
    }
  };

  const deleteChallenge = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch("/api/admin/challenges/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      log("Deleted challenge", { id, name });
      fetchChallenges();
    }
  };

  if (loading) return <p className="text-cg-white-dim">Loading...</p>;

  return (
    <div className="space-y-3">
      {challenges.map((c, idx) => (
        <div key={c.id} className="flex items-center gap-3 rounded-md border border-cg-border bg-cg-brown/50 px-4 py-3">
          <span className="w-8 text-sm font-bold text-cg-orange">#{idx + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-cg-white truncate">{c.name}</p>
            <p className="text-xs text-cg-white-dim">ID: {c.id} · {c.records?.length || 0} records</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => movePosition(c.id, -1)} disabled={idx === 0}
              className="cg-btn cg-btn-ghost px-2 py-1 text-xs disabled:opacity-30">↑</button>
            <button onClick={() => movePosition(c.id, 1)} disabled={idx === challenges.length - 1}
              className="cg-btn cg-btn-ghost px-2 py-1 text-xs disabled:opacity-30">↓</button>
            <button onClick={() => deleteChallenge(c.id, c.name)}
              className="cg-btn px-2 py-1 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10">Del</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingTab({ token, log }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    const res = await fetch("/api/admin/pending", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setRecords(data.records || []);
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  const approve = async (record) => {
    const res = await fetch("/api/admin/pending/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: record.id }),
    });
    if (res.ok) {
      log("Approved record", { player: record.playerName, challenge: record.challengeId });
      fetchRecords();
    }
  };

  const reject = async (record) => {
    const res = await fetch("/api/admin/pending/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: record.id }),
    });
    if (res.ok) {
      log("Rejected record", { player: record.playerName, challenge: record.challengeId });
      fetchRecords();
    }
  };

  if (loading) return <p className="text-cg-white-dim">Loading...</p>;

  if (records.length === 0) {
    return <div className="cg-card text-center py-8"><p className="text-cg-white-dim">No pending records. 🎉</p></div>;
  }

  return (
    <div className="space-y-3">
      {records.map((r) => (
        <div key={r.id} className="cg-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cg-white">
                {r.playerName} → {r.challengeId}
              </p>
              <div className="mt-1 space-y-0.5 text-xs text-cg-white-dim">
                <p>Video: <a href={r.videoLink} target="_blank" rel="noopener noreferrer" className="text-cg-orange underline">{r.videoLink}</a></p>
                {r.rawFootage && <p>Raw: <a href={r.rawFootage} target="_blank" rel="noopener noreferrer" className="text-cg-orange underline">{r.rawFootage}</a></p>}
                <p>Percent: {r.percent}% · Type: {r.listType} {r.time && `· Time: ${r.time}`}</p>
                <p>Submitted: {new Date(r.submittedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => approve(r)} className="cg-btn px-3 py-1.5 text-xs border border-green-500/30 text-green-400 hover:bg-green-500/10 rounded-md">Approve</button>
              <button onClick={() => reject(r)} className="cg-btn px-3 py-1.5 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-md">Reject</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContentTab({ token, log, contentKey, label }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    fetch(`/api/admin/content?key=${contentKey}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setItems(data.items || []));
  }, []);

  const save = async () => {
    await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key: contentKey, items }),
    });
    log(`Updated ${label}`, {});
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <textarea
            value={item}
            onChange={(e) => {
              const copy = [...items];
              copy[idx] = e.target.value;
              setItems(copy);
            }}
            className="cg-input flex-1 resize-none"
            rows={2}
          />
          <button onClick={() => setItems(items.filter((_, i) => i !== idx))}
            className="cg-btn px-3 py-1 text-xs border border-red-500/30 text-red-400 rounded-md">Remove</button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="cg-input flex-1"
          placeholder="Add new item..."
        />
        <button onClick={() => { if (newItem) { setItems([...items, newItem]); setNewItem(""); } }}
          className="cg-btn cg-btn-ghost text-sm">Add</button>
      </div>
      <button onClick={save} className="cg-btn cg-btn-primary text-sm">Save {label}</button>
    </div>
  );
}

function StaffTab({ token, log }) {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetch("/api/admin/content?key=content:staff", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setStaff(data.items || []));
  }, []);

  const save = async () => {
    await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key: "content:staff", items: staff }),
    });
    log("Updated Staff", {});
  };

  return (
    <div className="space-y-3">
      {staff.map((member, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            value={member.username || ""}
            onChange={(e) => { const c = [...staff]; c[idx] = { ...c[idx], username: e.target.value }; setStaff(c); }}
            className="cg-input flex-1"
            placeholder="Username"
          />
          <input
            value={member.role || ""}
            onChange={(e) => { const c = [...staff]; c[idx] = { ...c[idx], role: e.target.value }; setStaff(c); }}
            className="cg-input w-32"
            placeholder="Role"
          />
          <button onClick={() => setStaff(staff.filter((_, i) => i !== idx))}
            className="cg-btn px-3 py-1 text-xs border border-red-500/30 text-red-400 rounded-md">Remove</button>
        </div>
      ))}
      <button onClick={() => setStaff([...staff, { username: "", role: "", avatar: "", socials: {} }])}
        className="cg-btn cg-btn-ghost text-sm">Add Member</button>
      <button onClick={save} className="cg-btn cg-btn-primary text-sm">Save Staff</button>
    </div>
  );
}

function AdminsTab({ token, log, isOwner }) {
  const [admins, setAdmins] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetch("/api/admin/admins", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setAdmins(data.admins || []));
  }, []);

  const addAdmin = async () => {
    if (!newUsername || !newPassword) return;
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username: newUsername, password: newPassword }),
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      log("Added admin", { username: newUsername });
      setNewUsername("");
      setNewPassword("");
      setAdmins([...admins, { username: newUsername, isOwner: false }]);
    }
  };

  const removeAdmin = async (username) => {
    if (!confirm(`Remove admin ${username}?`)) return;
    await fetch("/api/admin/admins/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username }),
    });
    log("Removed admin", { username });
    setAdmins(admins.filter(a => a.username !== username));
  };

  return (
    <div className="space-y-4">
      {!isOwner && (
        <div className="cg-card border-cg-orange/30">
          <p className="text-sm text-cg-white-dim">Only the owner can add or remove admins.</p>
        </div>
      )}
      {isOwner && (
        <div className="cg-card">
          <h3 className="text-sm font-semibold text-cg-orange mb-3">Add New Admin</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="cg-input flex-1" placeholder="Username" />
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="cg-input flex-1" placeholder="Password" />
            <button onClick={addAdmin} className="cg-btn cg-btn-primary text-sm">Add Admin</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {admins.map((admin) => (
          <div key={admin.username} className="flex items-center gap-3 rounded-md border border-cg-border bg-cg-brown/50 px-4 py-3">
            <span className="text-sm font-medium text-cg-white">{admin.username}</span>
            {admin.isOwner && <span className="cg-badge bg-cg-yellow/10 text-cg-yellow border border-cg-yellow/30">Owner</span>}
            {isOwner && !admin.isOwner && (
              <button onClick={() => removeAdmin(admin.username)}
                className="ml-auto cg-btn px-3 py-1 text-xs border border-red-500/30 text-red-400 rounded-md">Remove</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LogsTab({ token }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/admin/logs", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setLogs(data.logs || []));
  }, []);

  return (
    <div className="space-y-2">
      {logs.length === 0 ? (
        <p className="text-cg-white-dim text-sm">No admin actions logged yet.</p>
      ) : (
        logs.map((log, idx) => (
          <div key={idx} className="rounded-md border border-cg-border bg-cg-brown/30 px-4 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-cg-white">{log.action}</span>
              <span className="text-xs text-cg-white-dim">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-xs text-cg-white-dim mt-0.5">By: {log.admin}</p>
            {log.details && Object.keys(log.details).length > 0 && (
              <p className="text-xs text-cg-white-dim/70 mt-0.5 font-mono">{JSON.stringify(log.details)}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* ── Main Admin Panel ── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [tab, setTab] = useState("challenges");
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      const userData = JSON.parse(u);
      if (userData.isAdmin) {
        setAuthed(true);
        setToken(t);
        setIsOwner(userData.isAdmin && userData.username === "admin");
      }
    }
  }, []);

  const log = async (action, details) => {
    await fetch("/api/admin/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, details }),
    });
  };

  if (!authed) return <AdminLogin onLogin={(data) => {
    setAuthed(true);
    setToken(data.token);
    setIsOwner(data.user.username === "admin");
  }} />;

  const tabs = [
    { id: "challenges", label: "Challenges" },
    { id: "pending", label: "Pending Records" },
    { id: "rules", label: "Rules" },
    { id: "submission", label: "Submission" },
    { id: "staff", label: "Staff" },
    { id: "admins", label: "Admins" },
    { id: "logs", label: "Logs" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="cg-section-title text-cg-white">Admin Panel</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/");
          }}
          className="cg-btn cg-btn-ghost text-sm"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              tab === t.id
                ? "bg-cg-orange text-cg-black"
                : "border border-cg-border text-cg-white-dim hover:text-cg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {tab === "challenges" && <ChallengesTab token={token} log={log} />}
        {tab === "pending" && <PendingTab token={token} log={log} />}
        {tab === "rules" && <ContentTab token={token} log={log} contentKey="content:rules" label="Rules" />}
        {tab === "submission" && <ContentTab token={token} log={log} contentKey="content:submission" label="Submission Guidelines" />}
        {tab === "staff" && <StaffTab token={token} log={log} />}
        {tab === "admins" && <AdminsTab token={token} log={log} isOwner={isOwner} />}
        {tab === "logs" && <LogsTab token={token} />}
      </div>
    </div>
  );
}
