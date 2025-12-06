
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState({ monasteries: 0, users: 0, ticketsPending: 0 });
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [message, setMessage] = useState("");
  const [busyMap, setBusyMap] = useState({});

  useEffect(() => {
    if (status === "loading") return;

    // If not logged in or not an admin, redirect
    if (!session || session.user?.role !== "admin") {
      router.replace("/login");
      return;
    }

    // load admin data
    fetchStats();
    fetchPending();
    // include router, session and status to satisfy exhaustive-deps
  }, [router, session, status]);

  async function fetchStats() {
    setLoadingStats(true);

    try {
      const [mRes, uRes, tRes] = await Promise.all([
        fetch("/api/monasteries").then(r => r.json()),
        fetch("/api/users").then(r => r.json()),
        fetch("/api/tickets").then(r => r.json()),
      ]);

      const monasteries = Array.isArray(mRes) ? mRes.length : 0;
      const users = Array.isArray(uRes) ? uRes.length : (uRes?.total || 0);
      const ticketsPending = Array.isArray(tRes)
        ? tRes.filter(t => t.paymentStatus === "pending").length
        : 0;

      setStats({ monasteries, users, ticketsPending });
    } catch (err) {
      console.error("Stats error", err);
    } finally {
      setLoadingStats(false);
    }
  }

  async function fetchPending() {
    setLoadingPending(true);
    try {
      const res = await fetch("/api/admin/pending-checkers");
      const json = await res.json();

      const list =
        Array.isArray(json)
          ? json
          : Array.isArray(json?.pending)
          ? json.pending
          : [];

      setPending(list);
    } catch (err) {
      console.error("Pending fetch error", err);
      setPending([]);
    } finally {
      setLoadingPending(false);
    }
  }

  function setBusy(id, val) {
    setBusyMap(prev => ({ ...prev, [id]: val }));
  }

  async function approve(id, email) {
    if (!confirm(`Approve ${email}?`)) return;

    try {
      setBusy(id, "approve");
      const res = await fetch(`/api/users/${id}/approve`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Approve failed");

      setMessage(`Approved ${email}`);
      setPending(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      setMessage(err.message || "Error approving");
    } finally {
      setBusy(id, false);
    }
  }

  async function rejectRequest(id, email) {
    if (!confirm(`Reject ${email}?`)) return;

    try {
      setBusy(id, "reject");
      const res = await fetch(`/api/users/${id}/reject`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Reject failed");

      setMessage(`Rejected ${email}`);
      setPending(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      setMessage(err.message || "Error rejecting");
    } finally {
      setBusy(id, false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">

      {/* ✅ FORCED BACKGROUND FIX */}
      <div className="absolute inset-0 z-[-2] bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]" />

      {/* Light fallback overlay */}
      <div className="absolute inset-0 z-[-1] bg-black/40 backdrop-blur-sm" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-5 rounded-xl bg-white/10 shadow-lg border border-white/10">
            <p className="text-gray-300 text-sm">Monasteries</p>
            <h2 className="mt-2 text-3xl font-bold">{stats.monasteries}</h2>
          </div>

          <div className="p-5 rounded-xl bg-white/10 shadow-lg border border-white/10">
            <p className="text-gray-300 text-sm">Users</p>
            <h2 className="mt-2 text-3xl font-bold">{stats.users}</h2>
          </div>

          <div className="p-5 rounded-xl bg-white/10 shadow-lg border border-white/10">
            <p className="text-gray-300 text-sm">Pending Tickets</p>
            <h2 className="mt-2 text-3xl font-bold">{stats.ticketsPending}</h2>
          </div>
        </div>

        {/* Pending Checker Section */}
        <div className="bg-white/10 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4">Pending Checker Requests</h3>

          {pending.length === 0 ? (
            <p className="text-gray-300">No pending requests.</p>
          ) : (
            <div className="space-y-4">
              {pending.map((u) => {
                const id = u._id;
                const busy = busyMap[id];

                return (
                  <div
                    key={id}
                    className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-gray-300 text-sm">{u.email}</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => approve(id, u.email)}
                        disabled={!!busy}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {busy === "approve" ? "..." : "Approve"}
                      </button>

                      <button
                        onClick={() => rejectRequest(id, u.email)}
                        disabled={!!busy}
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                      >
                        {busy === "reject" ? "..." : "Reject"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Popup */}
        {message && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-lg shadow">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
