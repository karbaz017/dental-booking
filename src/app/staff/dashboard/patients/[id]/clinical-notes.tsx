"use client";

import { useEffect, useState, useRef } from "react";

type Note = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string | null;
    email: string;
  };
};

type Props = {
  patientId: string;
};

const LANGUAGES = [
  { name: "Spanish", code: "es-ES" },
  { name: "French", code: "fr-FR" },
  { name: "German", code: "de-DE" },
  { name: "Italian", code: "it-IT" },
  { name: "Chinese (Mandarin)", code: "zh-CN" },
  { name: "Japanese", code: "ja-JP" },
  { name: "Hindi", code: "hi-IN" },
  { name: "Arabic", code: "ar-SA" },
  { name: "Portuguese", code: "pt-BR" },
];

export function ClinicalNotes({ patientId }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Voice Recognition States
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState("es-ES");
  const [voiceError, setVoiceError] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    async function loadNotes() {
      try {
        const res = await fetch(`/api/staff/patients/${patientId}/notes`);
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes ?? []);
        }
      } catch (err) {
        console.error("Failed to load notes", err);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, [patientId]);

  // Translate helper using Google Translate Free single-translation API
  async function translateToEnglish(text: string, fromLang: string): Promise<string> {
    try {
      const srcLang = fromLang.split("-")[0]; // e.g. "es-ES" -> "es"
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${srcLang}&tl=en&dt=t&q=${encodeURIComponent(
        text,
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json();
      const translated = data[0].map((item: any) => item[0]).join("");
      return translated;
    } catch (err) {
      console.error("Translation error", err);
      return text; // fallback
    }
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    setVoiceError("");
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = selectedLang;

    rec.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
    };

    rec.onerror = (e: any) => {
      console.error(e);
      setVoiceError(`Voice Error: ${e.error}`);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = async (event: any) => {
      let final = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        setSaving(true);
        const translated = await translateToEnglish(final, selectedLang);
        setContent((prev) => {
          const space = prev && !prev.endsWith(" ") ? " " : "";
          return prev + space + translated;
        });
        setSaving(false);
      }
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || saving) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/staff/patients/${patientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [data.note, ...prev]);
        setContent("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Note Editor */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Clinical Note</h3>

          {/* Voice Translator Controller */}
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-sm font-semibold text-slate-700">Voice Translation:</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm focus:border-teal-600 focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={toggleListening}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition ${
                isListening
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-teal-600 text-white hover:bg-teal-700"
              }`}
            >
              {isListening ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                  Stop Listening
                </>
              ) : (
                <>🎙️ Record in Native Language</>
              )}
            </button>
            {voiceError ? <p className="text-xs text-red-600 font-semibold w-full mt-1">{voiceError}</p> : null}
          </div>

          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing clinic notes in English, or click the mic to speak in your native language..."
              required
              rows={6}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2 placeholder:text-slate-400"
            />
            {interimTranscript ? (
              <div className="absolute bottom-3 left-4 right-4 bg-slate-100/90 rounded-lg p-2 text-xs text-slate-600 border border-slate-200">
                <span className="font-semibold text-slate-700 mr-1.5">Speaking:</span>
                {interimTranscript}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!content.trim() || saving}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? "Saving note..." : "Save Note (English)"}
            </button>
          </div>
        </form>

        {/* Notes Listing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Clinical History</h3>
          {loading ? (
            <p className="text-sm text-slate-500 animate-pulse">Loading patient history...</p>
          ) : notes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No clinical notes recorded for this patient.
            </p>
          ) : (
            <div className="space-y-4">
              {notes.map((n) => (
                <div key={n.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-medium text-slate-700">By {n.author.name || n.author.email}</span>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side Help Card */}
      <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-6 self-start">
        <h4 className="font-semibold text-teal-900 mb-2">🎙️ Voice Translate Instructions</h4>
        <ul className="text-xs text-teal-800 space-y-2 list-disc list-inside">
          <li>Select the native language from the dropdown menu.</li>
          <li>Click **Record in Native Language** and allow browser microphone permissions.</li>
          <li>Speak clearly. When you pause speaking, the recognition automatically processes the phrase.</li>
          <li>The spoken native text is translated to English and appended to the text editor.</li>
          <li>You can click record repeatedly to dictate additional details.</li>
        </ul>
      </div>
    </div>
  );
}
