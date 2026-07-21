"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const ChatInbox = dynamic(
  () => import("@/components/chat/chat-inbox").then((m) => ({ default: m.ChatInbox })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-0 flex-1 items-center justify-center p-8 text-sm text-slate-500">
        Loading support chat…
      </div>
    ),
  }
);

type Props = { userId: string };

export function PatientChatAssistantWidget({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const titleId = useId();
  const panelId = useId();
  const onFullPage = pathname === "/dashboard/chat";

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (onFullPage) {
    return null;
  }

  return (
    <>
      {!open && (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-600/30 ring-2 ring-white/20 transition hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        title="Get help from the front desk"
      >
        <span className="sr-only">Open support chat with the front desk</span>
        <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <ChatBubbleIcon className="h-7 w-7" />
      </button>
      )}

      {open && (
        <div className="pointer-events-auto fixed inset-0 z-[70]">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px] transition"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            className="absolute bottom-0 left-0 right-0 z-10 flex max-h-[min(90dvh,100%)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200/90 bg-white shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:max-h-[min(640px,90dvh)] sm:max-w-md sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-teal-50/80 to-slate-50/90 px-4 py-3">
              <div>
                <p
                  id={titleId}
                  className="text-sm font-semibold text-slate-900"
                >
                  Need help?
                </p>
                <p className="text-xs text-slate-600">
                  Message our team — we&apos;re here to assist.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href="/dashboard/chat"
                  className="hidden rounded-lg px-2.5 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-100/60 sm:inline"
                >
                  Full view
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200/50 hover:text-slate-800"
                  aria-label="Close chat"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex h-[min(28rem,65dvh)] min-h-0 flex-1 flex-col sm:h-[min(28rem,70dvh)]">
              <ChatInbox
                selfId={userId}
                showStaffAndPatientStarters={false}
                context="patient"
                layout="widget"
              />
            </div>
            <p className="border-t border-slate-100 bg-slate-50/80 px-3 py-2 text-center text-[0.65rem] text-slate-500 sm:hidden">
              <Link
                className="font-medium text-teal-700 underline-offset-2 hover:underline"
                href="/dashboard/chat"
              >
                Open messages
              </Link>{" "}
              for a full-screen chat.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 10.5h.008v.008H8.625v-.008zm3.75 0h.008v.008h-.008v-.008zm3.75 0h.008v.008h-.008v-.008zM2.25 5.25v12a2.25 2.25 0 002.25 2.25H9l3.11 2.11a.75.75 0 001.17-.59v-1.52H19.5a2.25 2.25 0 002.25-2.25v-12A2.25 2.25 0 0019.5 3h-15A2.25 2.25 0 002.25 5.25z"
      />
    </svg>
  );
}
