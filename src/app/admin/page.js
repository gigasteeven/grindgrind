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
        // Do NOT store user in localStorage — always verify with server
        onLogin(data.token);
      }
    } catch {
      setError("Login failed.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="cg-card p-6">
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
            <div className="rounded-md border-2 border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
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
function AddChallengeForm({ token, log, onAdded }) {
  const [form, setForm] = useState({
    name: "", id: "", author: "", verifier: "", verification: "",
    password: "Not Copyable", percentToQualify: 100, listType: "challenge", tags: "", position: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async () => {
    setError("");
    setSuccess("");
    if (!form.name || !form.id || !form.verifier) {
      setError("Name, Level ID, and Verifier are required");
      return;
    }
    const body = {
      ...form,
      id: String(form.id),
      percentToQualify: parseInt(form.percentToQualify) || 100,
      position: form.position ? parseInt(form.position) : null,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    };
    const res = await fetch("/api/admin/challenges/add", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      log("Added challenge", { name: form.name, id: form.id });
      setSuccess(`Added "${form.name}" to ${form.listType} list at position ${data.position || "end"}`);
      setForm({ name: "", id: "", author: "", verifier: "", verification: "", password: "Not Copyable", percentToQualify: 100, listType: "challenge", tags: "", position: "" });
      setTimeout(() => setSuccess(""), 3000);
      onAdded();
    }
  };

  return (
    <div className="cg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold text-cg-orange">Add New Challenge</h3>

      {/* List type */}
      <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: "var(--cg-surface-2)" }}>
        <button type="button" onClick={() => setForm({ ...form, listType: "challenge" })}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${form.listType === "challenge" ? "cg-btn-primary" : "text-cg-white-dim"}`}>
          Challenge
        </button>
        <button type="button" onClick={() => setForm({ ...form, listType: "platformer" })}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${form.listType === "platformer" ? "cg-btn-primary" : "text-cg-white-dim"}`}>
          Platformer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="cg-input" placeholder="Level Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="cg-input" placeholder="Level ID *" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
        <input className="cg-input" placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
        <input className="cg-input" placeholder="Verifier *" value={form.verifier} onChange={e => setForm({ ...form, verifier: e.target.value })} />
        <input className="cg-input" placeholder="Verification Video URL" value={form.verification} onChange={e => setForm({ ...form, verification: e.target.value })} />
        <input className="cg-input" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <input className="cg-input" type="number" placeholder="Qualify %" value={form.percentToQualify} onChange={e => setForm({ ...form, percentToQualify: e.target.value })} />
        <input className="cg-input" type="number" placeholder="Position (1 = top, empty = end)" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
      </div>
      <input className="cg-input" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />

      {error && <div className="text-sm text-red-400 bg-red-500/10 border-2 border-red-500/30 rounded-md px-3 py-2">{error}</div>}
      {success && <div className="text-sm text-green-400 bg-green-500/10 border-2 border-green-500/30 rounded-md px-3 py-2">{success}</div>}

      <button onClick={submit} className="cg-btn cg-btn-primary text-sm w-full">Add Challenge</button>
    </div>
  );
}

function ChallengesTab({ token, log }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

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
      <button onClick={() => setShowAdd(!showAdd)} className="cg-btn cg-btn-primary text-sm w-full">
        {showAdd ? "Close" : "+ Add New Challenge"}
      </button>

      {showAdd && <AddChallengeForm token={token} log={log} onAdded={fetchChallenges} />}

      {challenges.map((c, idx) => (
        <div key={c.id} className="flex items-center gap-3 rounded-md border-2 border-cg-border bg-cg-surface-2/50 px-4 py-3">
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
              className="cg-btn px-2 py-1 text-xs border-2 border-red-500/30 text-red-400 hover:bg-red-500/10">Del</button>
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

  const reject = async (record, reason) => {
    const res = await fetch("/api/admin/pending/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: record.id, reason }),
    });
    if (res.ok) {
      log("Rejected record", { player: record.playerName, challenge: record.challengeId, reason });
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
                {r.status === "approved" && <p className="text-green-400">✅ Approved</p>}
                {r.status === "rejected" && <p className="text-red-400">❌ Rejected: {r.reason}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {r.status === "pending" && (
                <>
                  <button onClick={() => approve(r)} className="cg-btn px-3 py-1.5 text-xs border-2 border-green-500/30 text-green-400 hover:bg-green-500/10 rounded-md">Approve</button>
                  <button
                    onClick={() => {
                      const reason = prompt("Reason for rejection (player will see this):");
                      if (reason !== null) reject(r, reason);
                    }}
                    className="cg-btn px-3 py-1.5 text-xs border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-md"
                  >
                    Reject
                  </button>
                </>
              )}
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
            className="cg-btn px-3 py-1 text-xs border-2 border-red-500/30 text-red-400 rounded-md">Remove</button>
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
    <div className="space-y-4">
      {staff.map((member, idx) => (
        <div key={idx} className="cg-card space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-cg-orange/30 shrink-0 bg-cg-surface-2 flex items-center justify-center">
              {member.avatar ? (
                <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-cg-orange">
                  {(member.username || "?").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                value={member.username || ""}
                onChange={(e) => { const c = [...staff]; c[idx] = { ...c[idx], username: e.target.value }; setStaff(c); }}
                className="cg-input"
                placeholder="Username"
              />
              <input
                value={member.role || ""}
                onChange={(e) => { const c = [...staff]; c[idx] = { ...c[idx], role: e.target.value }; setStaff(c); }}
                className="cg-input"
                placeholder="Role (e.g. Owner, Moderator)"
              />
            </div>
            <button onClick={() => setStaff(staff.filter((_, i) => i !== idx))}
              className="cg-btn px-3 py-1.5 text-xs border-2 border-red-500/30 text-red-400 rounded-md shrink-0">Remove</button>
          </div>

          <div>
            <label className="block text-xs text-cg-white-dim mb-1">Avatar URL</label>
            <input
              value={member.avatar || ""}
              onChange={(e) => { const c = [...staff]; c[idx] = { ...c[idx], avatar: e.target.value }; setStaff(c); }}
              className="cg-input"
              placeholder="https://... (image URL for avatar)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-cg-white-dim mb-1">Telegram</label>
              <input
                value={member.socials?.telegram || ""}
                onChange={(e) => { const c = [...staff]; c[idx] = { ...c[idx], socials: { ...c[idx].socials, telegram: e.target.value } }; setStaff(c); }}
                className="cg-input"
                placeholder="https://t.me/..."
              />
            </div>
            <div>
              <label className="block text-xs text-cg-white-dim mb-1">Discord</label>
              <input
                value={member.socials?.discord || ""}
                onChange={(e) => { const c = [...staff]; c[idx] = { ...c[idx], socials: { ...c[idx].socials, discord: e.target.value } }; setStaff(c); }}
                className="cg-input"
                placeholder="Discord invite link"
              />
            </div>
            <div>
              <label className="block text-xs text-cg-white-dim mb-1">YouTube</label>
              <input
                value={member.socials?.youtube || ""}
                onChange={(e) => { const c = [...staff]; c[idx] = { ...c[idx], socials: { ...c[idx].socials, youtube: e.target.value } }; setStaff(c); }}
                className="cg-input"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <button onClick={() => setStaff([...staff, { username: "", role: "", avatar: "", socials: {} }])}
          className="cg-btn cg-btn-ghost text-sm">Add Member</button>
        <button onClick={save} className="cg-btn cg-btn-primary text-sm">Save Staff</button>
      </div>
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
          <div key={admin.username} className="flex items-center gap-3 rounded-md border-2 border-cg-border bg-cg-surface-2/50 px-4 py-3">
            <span className="text-sm font-medium text-cg-white">{admin.username}</span>
            {admin.isOwner && <span className="cg-badge bg-cg-yellow/10 text-cg-yellow border border-cg-yellow/30">Owner</span>}
            {isOwner && !admin.isOwner && (
              <button onClick={() => removeAdmin(admin.username)}
                className="ml-auto cg-btn px-3 py-1 text-xs border-2 border-red-500/30 text-red-400 rounded-md">Remove</button>
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
          <div key={idx} className="rounded-md border-2 border-cg-border bg-cg-surface-2/30 px-4 py-2.5">
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

/* ── Users management tab ── */
function UsersTab({ token, log }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const saveUser = async (username) => {
    const body = { username };
    if (newPassword) body.newPassword = newPassword;
    if (newCountry !== undefined) body.newCountry = newCountry;

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      log("Updated user", { username, password: newPassword ? "changed" : undefined, country: newCountry });
      setSuccess(`Updated ${username}`);
      setEditingUser(null);
      setNewPassword("");
      setNewCountry("");
      setTimeout(() => setSuccess(""), 3000);
      fetchUsers();
    }
  };

  if (loading) return <p className="text-cg-white-dim">Loading...</p>;

  const owner = users.find(u => u.isOwner);
  const otherUsers = users.filter(u => !u.isOwner);

  return (
    <div className="space-y-3">
      {success && (
        <div className="cg-card border-green-500/30 p-3 text-sm text-green-400">{success}</div>
      )}

      {owner && (
        <div className="cg-card p-4" style={{ borderColor: "color-mix(in srgb, var(--cg-yellow) 30%, var(--cg-border))" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cg-surface-2 border-2 border-cg-border flex items-center justify-center">
              <span className="text-sm font-bold text-cg-yellow">👑</span>
            </div>
            <div>
              <p className="text-sm font-medium text-cg-white">{owner.username}</p>
              <p className="text-xs text-cg-white-dim">
                {owner.country || "No country"} · Owner
              </p>
            </div>
          </div>
        </div>
      )}

      {otherUsers.map((u) => (
        <div key={u.username} className="cg-card p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cg-surface-2 border-2 border-cg-border flex items-center justify-center">
                <span className="text-sm font-bold text-cg-orange">{u.username.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-cg-white">{u.username}</p>
                <p className="text-xs text-cg-white-dim">
                  {u.country || "No country"} · {u.isAdmin ? "Admin" : "Player"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingUser(editingUser === u.username ? null : u.username);
                setNewPassword("");
                setNewCountry(u.country || "");
              }}
              className="cg-btn cg-btn-ghost text-xs"
            >
              {editingUser === u.username ? "Cancel" : "Edit"}
            </button>
          </div>

          {editingUser === u.username && (
            <div className="mt-4 pt-4 border-t-2 border-cg-border space-y-3">
              <div>
                <label className="block text-xs text-cg-white-dim mb-1">New Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="cg-input"
                  placeholder="Leave empty to keep current"
                />
              </div>
              <div>
                <label className="block text-xs text-cg-white-dim mb-1">Country (2-letter code)</label>
                <input
                  type="text"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value.toUpperCase().slice(0, 2))}
                  className="cg-input"
                  placeholder="e.g. RU, US, DE"
                />
              </div>
              <button onClick={() => saveUser(u.username)} className="cg-btn cg-btn-primary text-sm">
                Save Changes
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main Admin Panel ── */
export default function AdminPage() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState("challenges");
  const router = useRouter();

  // On mount: check if we have a token, then VERIFY it with the server
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      setAuthLoading(false);
      return;
    }
    // Verify token with server — NEVER trust localStorage for admin status
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then(data => {
        if (data.isAdmin) {
          setToken(t);
          setUser(data);
        }
        // If not admin, token stays null → login form shows
      })
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const log = async (action, details) => {
    await fetch("/api/admin/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, details }),
    });
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-cg-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If no valid admin token → show login form (ALWAYS, regardless of localStorage)
  if (!token || !user) {
    return <AdminLogin onLogin={(newToken) => {
      // After login, verify with server again
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${newToken}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.isAdmin) {
            setToken(newToken);
            setUser(data);
          } else {
            alert("You do not have admin access.");
          }
        });
    }} />;
  }

  const tabs = [
    { id: "challenges", label: "Challenges" },
    { id: "pending", label: "Pending Records" },
    { id: "users", label: "Users" },
    { id: "rules", label: "Rules" },
    { id: "submission", label: "Submission" },
    { id: "staff", label: "Staff" },
    { id: "admins", label: "Admins" },
    { id: "logs", label: "Logs" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="cg-section-title text-cg-white">Admin Panel</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-cg-white-dim hidden sm:inline">{user.username}</span>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              setToken(null);
              setUser(null);
              router.push("/");
            }}
            className="cg-btn cg-btn-ghost text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              tab === t.id
                ? "cg-btn-primary"
                : "border-2 border-cg-border text-cg-white-dim hover:text-cg-white"
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
        {tab === "users" && <UsersTab token={token} log={log} />}
        {tab === "rules" && <ContentTab token={token} log={log} contentKey="content:rules" label="Rules" />}
        {tab === "submission" && <ContentTab token={token} log={log} contentKey="content:submission" label="Submission Guidelines" />}
        {tab === "staff" && <StaffTab token={token} log={log} />}
        {tab === "admins" && <AdminsTab token={token} log={log} isOwner={user.isOwner} />}
        {tab === "logs" && <LogsTab token={token} />}
      </div>
    </div>
  );
}
