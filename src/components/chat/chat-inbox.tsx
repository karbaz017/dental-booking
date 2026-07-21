"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, startTransition } from "react";
import type { Role } from "@prisma/client";

type ThreadRow = {
  id: string;
  other: { id: string; name: string | null; email: string; role: Role };
  lastMessage: { body: string; createdAt: string; senderId: string } | null;
  hasUnread: boolean;
  updatedAt: string;
};

type MessageRow = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string | null; email: string; role: Role };
};

type Peer = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  department: string | null;
};

const POLL_MS = 4_000;

const fetchJson = (input: string, init?: RequestInit) => {
  const hasBody = init?.body != null;
  return fetch(input, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
};

function roleLabel(role: Role) {
  if (role === "FRONT_DESK") return "Front desk";
  if (role === "SUPERVISOR") return "Supervisor";
  if (role === "DOCTOR") return "Dentist";
  return "Patient";
}

function shortTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString(undefined, { timeStyle: "short" });
  }
  return d.toLocaleString(undefined, { month: "short", day: "numeric" });
}

function peerIdFromValue(value: string, withPrefix: boolean): string {
  if (!value) return "";
  if (withPrefix && (value.startsWith("s:") || value.startsWith("p:"))) {
    return value.slice(2);
  }
  return value;
}

function initials(name: string | null, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0]![0]! + (parts[1]![0]! ?? "")).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return (email[0] ?? "?").toUpperCase();
}

type Props = {
  selfId: string;
  showStaffAndPatientStarters: boolean;
  context: "patient" | "staff";
  /**
   * `widget`: stacked layout (conversation list on top) for a floating help panel.
   * `default`: two-column layout for full pages.
   */
  layout?: "default" | "widget";
};

export function ChatInbox({
  selfId,
  showStaffAndPatientStarters,
  context,
  layout = "default",
}: Props) {
  const inWidget = layout === "widget";
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [peers, setPeers] = useState<{ staffPeers: Peer[]; patients: Peer[] }>({
    staffPeers: [],
    patients: [],
  });
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [newPeer, setNewPeer] = useState("");

  const loadThreads = useCallback(async () => {
    const res = await fetchJson("/api/chat/threads");
    if (!res.ok) {
      if (res.status === 401) {
        return;
      }
      let message = "Could not load conversations.";
      try {
        const j = (await res.json()) as { error?: string };
        if (j.error) message = j.error;
      } catch {
        // ignore
      }
      startTransition(() => setErr(message));
      return;
    }
    const d = (await res.json()) as { threads: ThreadRow[] };
    startTransition(() => {
      setErr(null);
      setThreads(d.threads);
    });
  }, []);

  const loadPeers = useCallback(async () => {
    const res = await fetchJson("/api/chat/peers");
    if (!res.ok) {
      if (res.status === 401) return;
      startTransition(() => setErr("Could not load contacts to message."));
      return;
    }
    const p = (await res.json()) as { staffPeers: Peer[]; patients: Peer[] };
    startTransition(() => setPeers(p));
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    const res = await fetchJson(`/api/chat/threads/${id}/messages`);
    if (!res.ok) {
      startTransition(() => setErr("Could not load messages."));
      return;
    }
    const d = (await res.json()) as { messages: MessageRow[] };
    startTransition(() => {
      setErr(null);
      setMessages(d.messages);
    });
    await fetchJson(`/api/chat/threads/${id}/read`, { method: "POST" });
  }, []);

  useEffect(() => {
    void loadThreads();
    void loadPeers();
  }, [loadPeers, loadThreads]);

  useEffect(() => {
    const t = setInterval(() => {
      void loadThreads();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [loadThreads]);

  useEffect(() => {
    if (!threadId) return;
    const t = setInterval(() => {
      void (async () => {
        const res = await fetchJson(`/api/chat/threads/${threadId}/messages`);
        if (res.ok) {
          const d = (await res.json()) as { messages: MessageRow[] };
          startTransition(() => setMessages(d.messages));
        }
        await fetchJson(`/api/chat/threads/${threadId}/read`, { method: "POST" });
        void loadThreads();
      })();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [loadThreads, threadId]);

  async function openOrCreateWith(peerId: string) {
    setPending(true);
    setErr(null);
    const res = await fetchJson("/api/chat/threads", {
      method: "POST",
      body: JSON.stringify({ peerUserId: peerId }),
    });
    setPending(false);
    if (!res.ok) {
      const t = (await res.json().catch(() => ({}))) as { error?: string };
      startTransition(() => setErr(t.error ?? "Could not start chat."));
      return;
    }
    const d = (await res.json()) as { thread: { id: string } };
    const id = d.thread.id;
    // Must not wrap in startTransition: the message pane is gated on `threadId`, and
    // deferred updates can leave `threadId` null so the chat never appears to open.
    setErr(null);
    setNewOpen(false);
    setNewPeer("");
    setThreadId(id);
    void loadMessages(id);
    void loadThreads();
  }

  const activeThread = threads.find((r) => r.id === threadId) ?? null;
  const noFrontDesk = context === "patient" && peers.staffPeers.length === 0;

  return (
    <div
      className={
        inWidget
          ? "flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-white"
          : "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/50 ring-1 ring-slate-200/50"
      }
    >
      <div
        className={
          inWidget
            ? "flex h-full min-h-0 w-full min-w-0 flex-col"
            : "grid h-[min(680px,86dvh)] min-h-0 w-full max-w-5xl md:grid-cols-[minmax(200px,280px)_1fr]"
        }
      >
        <aside
          className={
            inWidget
              ? "flex max-h-[min(20rem,48vh)] min-h-0 w-full shrink-0 flex-col overflow-y-auto border-b border-slate-200/90 bg-slate-50/90"
              : "flex min-h-0 min-w-0 flex-col border-b border-slate-200/90 bg-slate-50/90 md:border-b-0 md:border-r"
          }
        >
          <div className="shrink-0 border-b border-slate-200/80 bg-slate-100/60 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-slate-800">
                {context === "patient" ? "Support" : "Conversations"}
              </h2>
              <button
                type="button"
                onClick={() => setNewOpen((v) => !v)}
                className="rounded-full bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                New
              </button>
            </div>
            {newOpen && (
              <div className="mt-3 space-y-2.5">
                {showStaffAndPatientStarters ? (
                  <>
                    <label className="block text-[0.7rem] font-medium uppercase tracking-wide text-slate-500">
                      Staff
                    </label>
                    <select
                      className="w-full rounded-lg border-0 bg-white py-2 pl-2.5 pr-2 text-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500"
                      value={newPeer.startsWith("s:") ? newPeer : ""}
                      onChange={(e) => setNewPeer(e.target.value)}
                    >
                      <option value="">— Choose staff —</option>
                      {peers.staffPeers.map((p) => (
                        <option key={p.id} value={`s:${p.id}`}>
                          {(p.name ?? p.email) + " · " + roleLabel(p.role)}
                        </option>
                      ))}
                    </select>
                    <label className="mt-0.5 block text-[0.7rem] font-medium uppercase tracking-wide text-slate-500">
                      Patients
                    </label>
                    <select
                      className="w-full rounded-lg border-0 bg-white py-2 pl-2.5 pr-2 text-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500"
                      value={newPeer.startsWith("p:") ? newPeer : ""}
                      onChange={(e) => setNewPeer(e.target.value)}
                    >
                      <option value="">— Choose patient —</option>
                      {peers.patients.map((p) => (
                        <option key={p.id} value={`p:${p.id}`}>
                          {p.name ?? p.email}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label className="block text-[0.7rem] font-medium uppercase tracking-wide text-slate-500">
                      {peers.patients.length ? "Staff or patients" : "Message"}
                    </label>
                    <select
                      className="w-full rounded-lg border-0 bg-white py-2 pl-2.5 pr-2 text-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500"
                      value={newPeer}
                      onChange={(e) => setNewPeer(e.target.value)}
                    >
                      <option value="">— Select contact —</option>
                      {peers.staffPeers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {(p.name ?? p.email) + " · " + roleLabel(p.role)}
                        </option>
                      ))}
                      {peers.patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name ?? p.email} · Patient
                        </option>
                      ))}
                    </select>
                  </>
                )}
                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    disabled={pending || !newPeer}
                    onClick={() => {
                      const raw = peerIdFromValue(
                        newPeer,
                        showStaffAndPatientStarters,
                      );
                      if (!raw) return;
                      void openOrCreateWith(raw);
                    }}
                    className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-40"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewOpen(false);
                      setNewPeer("");
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          {noFrontDesk && (
            <p className="m-2 rounded-lg border border-amber-200/80 bg-amber-50 px-2.5 py-2 text-xs text-amber-900">
              No front-desk user is set up yet. Check back later or call the office.
            </p>
          )}
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {threads.length === 0 && (
              <li className="px-3 py-8 text-center text-xs text-slate-500">
                No conversations. Tap <span className="font-semibold text-slate-700">New</span> to
                start.
              </li>
            )}
            {threads.map((th) => (
              <li key={th.id}>
                <button
                  type="button"
                  onClick={() => {
                    setThreadId(th.id);
                    void loadMessages(th.id);
                  }}
                  className={`flex w-full items-start gap-2.5 border-b border-slate-100/90 px-3 py-2.5 text-left transition ${
                    th.id === threadId
                      ? "bg-white shadow-inner shadow-slate-200/30 ring-1 ring-slate-100/80"
                      : "hover:bg-slate-100/80"
                  }`}
                >
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[0.7rem] font-bold text-teal-800"
                    aria-hidden
                  >
                    {initials(th.other.name, th.other.email)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {th.other.name ?? th.other.email}
                      </span>
                      {th.lastMessage && (
                        <time
                          className="shrink-0 text-[0.65rem] text-slate-400"
                          dateTime={th.lastMessage.createdAt}
                        >
                          {shortTime(th.lastMessage.createdAt)}
                        </time>
                      )}
                    </div>
                    <div className="text-[0.65rem] text-slate-500">{roleLabel(th.other.role)}</div>
                    {th.lastMessage && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {th.lastMessage.body}
                      </p>
                    )}
                    {th.hasUnread && (
                      <span className="mt-0.5 inline-block rounded-full bg-teal-500 px-1.5 text-[0.6rem] font-bold uppercase text-white">
                        New
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section
          className={
            inWidget
              ? "flex min-h-0 w-full min-w-0 flex-1 flex-col bg-gradient-to-b from-slate-50/90 to-slate-100/40"
              : "flex min-h-0 min-w-0 flex-1 flex-col bg-gradient-to-b from-slate-50/90 to-slate-100/40"
          }
        >
          {threadId ? (
            <MessageView
              key={threadId}
              selfId={selfId}
              otherLabel={activeThread?.other.name ?? activeThread?.other.email ?? "Chat"}
              otherEmail={activeThread?.other.email ?? ""}
              otherRole={activeThread?.other.role}
              supportHint={
                context === "patient"
                  ? "Front desk can help with scheduling, billing, and visit questions."
                  : "Clinic messaging — not for medical emergencies. Call 911 in an emergency."
              }
              messages={messages}
              onMessageSent={async (body) => {
                const res = await fetchJson(`/api/chat/threads/${threadId}/messages`, {
                  method: "POST",
                  body: JSON.stringify({ body }),
                });
                if (!res.ok) {
                  const t = (await res.json().catch(() => ({}))) as { error?: string };
                  startTransition(() => setErr(t.error ?? "Failed to send."));
                  return;
                }
                const d = (await res.json()) as { message: MessageRow };
                startTransition(() => {
                  setErr(null);
                  setMessages((m) => [...m, d.message]);
                });
                void loadThreads();
              }}
              err={err}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-slate-500">
              <div
                className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow ring-1 ring-slate-200/80"
                aria-hidden
              >
                <svg
                  className="h-7 w-7 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              {context === "patient" ? (
                <>
                  <p className="text-base font-medium text-slate-800">Clinic support</p>
                  <p className="max-w-sm text-pretty text-xs text-slate-500">
                    Choose someone from the list, or start a{" "}
                    <strong>new</strong>
                    {" "}conversation with the front desk.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-medium text-slate-800">Select a thread</p>
                  <p className="max-w-sm text-pretty text-xs text-slate-500">
                    Pick a chat on the left, or <strong>open a new one</strong>
                    {" "}
                    with a colleague (or a patient, if you&apos;re front desk).
                  </p>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MessageView({
  selfId,
  otherLabel,
  otherEmail,
  otherRole,
  supportHint,
  messages,
  onMessageSent,
  err,
}: {
  selfId: string;
  otherLabel: string;
  otherEmail: string;
  otherRole?: Role;
  supportHint: string;
  messages: MessageRow[];
  onMessageSent: (b: string) => Promise<void>;
  err: string | null;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [messages]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600"
            aria-hidden
          >
            {initials(otherLabel, otherEmail || otherLabel)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-slate-900">{otherLabel}</h3>
            <p className="text-xs text-slate-500">
              {otherRole ? roleLabel(otherRole) : "Member"}
              {otherEmail && <span className="ml-1 text-slate-400">· {otherEmail}</span>}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[0.65rem] text-slate-400">{supportHint}</p>
          </div>
        </div>
      </div>

      {err && (
        <p
          className="shrink-0 border-b border-red-200/60 bg-red-50 px-4 py-2 text-xs text-red-800"
          role="alert"
        >
          {err}
        </p>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {messages.length === 0 && (
          <p className="px-1 text-center text-sm text-slate-500">No messages yet. Say hi.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender.id === selfId;
          return (
            <div
              key={m.id}
              className={`flex gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold ${
                  mine
                    ? "bg-sky-200 text-sky-900"
                    : "bg-white text-slate-600 ring-1 ring-slate-200/90"
                }`}
                title={m.sender.name ?? m.sender.email}
                aria-hidden
              >
                {initials(m.sender.name, m.sender.email)}
              </span>
              <div
                className={`min-w-0 max-w-[min(100%,20rem)] sm:max-w-[24rem] ${
                  mine ? "items-end" : "items-start"
                } flex flex-col gap-0.5`}
              >
                <div
                  className={`rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                    mine
                      ? "bg-sky-600 text-white shadow-sky-600/15"
                      : "border border-slate-200/80 bg-white text-slate-800 ring-1 ring-slate-100/80"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                </div>
                <time
                  className={`px-0.5 text-[0.65rem] ${
                    mine ? "text-sky-700/90" : "text-slate-500"
                  }`}
                  dateTime={m.createdAt}
                >
                  {new Date(m.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} className="h-px" aria-hidden />
      </div>

      <form
        className="shrink-0 border-t border-slate-200/80 bg-white/90 px-3 py-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const t = text.trim();
          if (!t || sending) return;
          setSending(true);
          setText("");
          try {
            await onMessageSent(t);
          } finally {
            setSending(false);
          }
        }}
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl bg-slate-100/90 p-1.5 pl-2 ring-1 ring-slate-200/60 focus-within:ring-2 focus-within:ring-teal-500/30">
          <label className="sr-only" htmlFor="chat-compose">
            Type your message
          </label>
          <textarea
            id="chat-compose"
            className="min-h-11 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0"
            placeholder="Write a message…"
            value={text}
            rows={1}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
              }
            }}
            aria-label="Message"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-teal-700 disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-1.5 text-center text-[0.65rem] text-slate-400">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </form>
    </div>
  );
}
