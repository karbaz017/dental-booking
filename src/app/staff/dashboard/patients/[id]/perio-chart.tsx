"use client";

import { useEffect, useState, useRef } from "react";

type ToothData = {
  num: number;
  buccal: {
    distal: number | "";
    mid: number | "";
    mesial: number | "";
  };
  lingual: {
    distal: number | "";
    mid: number | "";
    mesial: number | "";
  };
  bopBuccal: {
    distal: boolean;
    mid: boolean;
    mesial: boolean;
  };
  bopLingual: {
    distal: boolean;
    mid: boolean;
    mesial: boolean;
  };
};

type FocusState = {
  toothNum: number;
  surface: "buccal" | "lingual";
  site: "distal" | "mid" | "mesial";
};

type Props = {
  patientId: string;
};

// Create a clean template for 32 teeth
function createInitialTeeth(): ToothData[] {
  const list: ToothData[] = [];
  for (let i = 1; i <= 32; i++) {
    list.push({
      num: i,
      buccal: { distal: "", mid: "", mesial: "" },
      lingual: { distal: "", mid: "", mesial: "" },
      bopBuccal: { distal: false, mid: false, mesial: false },
      bopLingual: { distal: false, mid: false, mesial: false },
    });
  }
  return list;
}

const wordToNumMap: Record<string, number> = {
  one: 1, won: 1, "1": 1,
  two: 2, to: 2, too: 2, "2": 2,
  three: 3, tree: 3, "3": 3,
  four: 4, for: 4, fore: 4, "4": 4,
  five: 5, "5": 5,
  six: 6, "6": 6,
  seven: 7, "7": 7,
  eight: 8, ate: 8, "8": 8,
  nine: 9, "9": 9,
  ten: 10, "10": 10,
  zero: 0, "0": 0,
};

const toothNumberMap: Record<string, number> = {
  one: 1, won: 1, "1": 1,
  two: 2, to: 2, too: 2, "2": 2,
  three: 3, tree: 3, "3": 3,
  four: 4, for: 4, fore: 4, "4": 4,
  five: 5, "5": 5,
  six: 6, "6": 6,
  seven: 7, "7": 7,
  eight: 8, ate: 8, "8": 8,
  nine: 9, "9": 9,
  ten: 10, "10": 10,
  eleven: 11, "11": 11,
  twelve: 12, "12": 12,
  thirteen: 13, "13": 13,
  fourteen: 14, "14": 14,
  fifteen: 15, "15": 15,
  sixteen: 16, "16": 16,
  seventeen: 17, "17": 17,
  eighteen: 18, "18": 18,
  nineteen: 19, "19": 19,
  twenty: 20, "20": 20,
  thirty: 30, "30": 30,
  "21": 21, "22": 22, "23": 23, "24": 24, "25": 25, "26": 26, "27": 27, "28": 28, "29": 29,
  "31": 31, "32": 32,
};

export function PerioChartComponent({ patientId }: Props) {
  const [teeth, setTeeth] = useState<ToothData[]>(createInitialTeeth());
  const [focus, setFocus] = useState<FocusState>({
    toothNum: 1,
    surface: "buccal",
    site: "distal",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [lastPhrase, setLastPhrase] = useState("");

  const recognitionRef = useRef<any>(null);
  const shouldBeListeningRef = useRef<boolean>(false);

  // Stop listening on unmount
  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  // Load existing chart
  useEffect(() => {
    async function loadChart() {
      try {
        const res = await fetch(`/api/staff/patients/${patientId}/perio`);
        if (res.ok) {
          const data = await res.json();
          if (data.chart) {
            setTeeth(JSON.parse(data.chart.data));
            setLastSaved(new Date(data.chart.createdAt).toLocaleString());
          }
        }
      } catch (err) {
        console.error("Failed to load perio chart", err);
      } finally {
        setLoading(false);
      }
    }
    loadChart();
  }, [patientId]);

  // Focus Navigation Helpers
  const advanceFocus = (currentFocus: FocusState) => {
    let next: FocusState;
    if (currentFocus.site === "distal") {
      next = { ...currentFocus, site: "mid" };
    } else if (currentFocus.site === "mid") {
      next = { ...currentFocus, site: "mesial" };
    } else {
      // mesial
      if (currentFocus.surface === "buccal") {
        next = { ...currentFocus, surface: "lingual", site: "distal" };
      } else {
        // lingual, go to next tooth
        const nextNum = currentFocus.toothNum === 32 ? 1 : currentFocus.toothNum + 1;
        next = { toothNum: nextNum, surface: "buccal", site: "distal" };
      }
    }
    setFocus(next);
    return next;
  };

  const retreatFocus = (currentFocus: FocusState) => {
    let prev: FocusState;
    if (currentFocus.site === "mesial") {
      prev = { ...currentFocus, site: "mid" };
    } else if (currentFocus.site === "mid") {
      prev = { ...currentFocus, site: "distal" };
    } else {
      // distal
      if (currentFocus.surface === "lingual") {
        prev = { ...currentFocus, surface: "buccal", site: "mesial" };
      } else {
        // buccal, go to prev tooth
        const prevNum = currentFocus.toothNum === 1 ? 32 : currentFocus.toothNum - 1;
        prev = { toothNum: prevNum, surface: "lingual", site: "mesial" };
      }
    }
    setFocus(prev);
    return prev;
  };

  // Update teeth cells
  const updateCellValue = (toothNum: number, surface: "buccal" | "lingual", site: "distal" | "mid" | "mesial", val: number | "") => {
    setTeeth((prevTeeth) => {
      const copy = [...prevTeeth];
      const index = toothNum - 1;
      copy[index] = {
        ...copy[index],
        [surface]: {
          ...copy[index][surface],
          [site]: val,
        },
      };
      return copy;
    });
  };

  const toggleCellBop = (toothNum: number, surface: "buccal" | "lingual", site: "distal" | "mid" | "mesial") => {
    setTeeth((prevTeeth) => {
      const copy = [...prevTeeth];
      const index = toothNum - 1;
      const bopKey = surface === "buccal" ? "bopBuccal" : "bopLingual";
      copy[index] = {
        ...copy[index],
        [bopKey]: {
          ...copy[index][bopKey] as any,
          [site]: !(copy[index][bopKey] as any)[site],
        },
      };
      return copy;
    });
  };

  // Voice Command Processing
  const processVoiceTranscript = (transcript: string) => {
    setLastPhrase(transcript);
    const rawWords = transcript
      .toLowerCase()
      .split(/[\s-]+/)
      .map((w) => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim())
      .filter(Boolean);

    const words: string[] = [];
    rawWords.forEach((word) => {
      if (/^\d+$/.test(word) && word !== "10" && word.length > 1) {
        for (let char of word) {
          words.push(char);
        }
      } else {
        words.push(word);
      }
    });

    setFocus((currFocus) => {
      let activeFocus = { ...currFocus };
      let i = 0;

      while (i < words.length) {
        const word = words[i];

        // Handle "tooth [num]", "teeth [num]", "t [num]" or "t[num]" (like t26)
        let isToothCommand = false;
        let targetTooth = 0;
        let tokensConsumed = 0;

        const tMatch = word.match(/t(\d+)$/);
        if (tMatch) {
          const num = parseInt(tMatch[1]);
          if (num >= 1 && num <= 32) {
            targetTooth = num;
            isToothCommand = true;
            tokensConsumed = 1;
          }
        } else if (word.endsWith("tooth") || word.endsWith("teeth") || word === "t") {
          if (i + 1 < words.length) {
            const nextWord = words[i + 1].trim();
            if (nextWord === "twenty" || nextWord === "thirty") {
              const base = nextWord === "twenty" ? 20 : 30;
              if (
                i + 2 < words.length &&
                toothNumberMap[words[i + 2].trim()] !== undefined &&
                toothNumberMap[words[i + 2].trim()] <= 9
              ) {
                const target = base + toothNumberMap[words[i + 2].trim()];
                if (target >= 1 && target <= 32) {
                  targetTooth = target;
                  isToothCommand = true;
                  tokensConsumed = 3;
                }
              } else {
                if (base >= 1 && base <= 32) {
                  targetTooth = base;
                  isToothCommand = true;
                  tokensConsumed = 2;
                }
              }
            } else if (toothNumberMap[nextWord] !== undefined) {
              const target = toothNumberMap[nextWord];
              if (target >= 1 && target <= 32) {
                targetTooth = target;
                isToothCommand = true;
                tokensConsumed = 2;
              }
            }
          }
        }

        if (isToothCommand) {
          activeFocus = { toothNum: targetTooth, surface: "buccal", site: "distal" };
          i += tokensConsumed;
          continue;
        }

        // Handle regular commands
        if (word === "bleeding" || word === "blood" || word === "bop") {
          toggleCellBop(activeFocus.toothNum, activeFocus.surface, activeFocus.site);
        } else if (word === "next" || word === "skip") {
          activeFocus = advanceFocus(activeFocus);
        } else if (word === "back" || word === "previous") {
          activeFocus = retreatFocus(activeFocus);
        } else if (word === "clear" || word === "reset") {
          updateCellValue(activeFocus.toothNum, activeFocus.surface, "distal", "");
          updateCellValue(activeFocus.toothNum, activeFocus.surface, "mid", "");
          updateCellValue(activeFocus.toothNum, activeFocus.surface, "mesial", "");
        } else if (word === "stop" || word === "pause") {
          toggleListening();
        } else if (wordToNumMap[word] !== undefined) {
          const val = wordToNumMap[word];
          updateCellValue(activeFocus.toothNum, activeFocus.surface, activeFocus.site, val);
          activeFocus = advanceFocus(activeFocus);
        }

        i++;
      }

      return activeFocus;
    });
  };

  const toggleListening = () => {
    if (isListening) {
      shouldBeListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    setVoiceError("");
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Speech recognition not supported in this browser.");
      return;
    }

    shouldBeListeningRef.current = true;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      setLastPhrase("");
    };

    rec.onerror = (e: any) => {
      console.error(e);
      if (e.error !== "no-speech" && e.error !== "aborted") {
        setVoiceError(`Voice recognition error: ${e.error}`);
      }
    };

    rec.onend = () => {
      if (shouldBeListeningRef.current) {
        try {
          rec.start();
        } catch (err) {
          console.error("Failed to restart speech recognition", err);
        }
      } else {
        setIsListening(false);
      }
    };

    rec.onresult = (event: any) => {
      const resultIndex = event.resultIndex;
      const transcript = event.results[resultIndex][0].transcript;
      processVoiceTranscript(transcript);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Save Perio Chart
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/patients/${patientId}/perio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: teeth }),
      });
      if (res.ok) {
        setLastSaved(new Date().toLocaleString());
      }
    } catch (err) {
      console.error("Save error", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500 animate-pulse">Loading perio chart records...</p>;
  }

  // Split teeth array into Upper Arch (Teeth 1-16) and Lower Arch (Teeth 17-32)
  const upperArch = teeth.slice(0, 16);
  const lowerArch = teeth.slice(16, 32);

  return (
    <div className="space-y-6">
      {/* Voice Controls Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleListening}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition ${
              isListening
                ? "bg-red-600 text-white animate-pulse"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            {isListening ? (
              <>
                <span className="h-3 w-3 rounded-full bg-white animate-ping"></span>
                🎙️ Listening... Click to Pause
              </>
            ) : (
              <>🎙️ Record Perio by Voice</>
            )}
          </button>
          {isListening ? (
            <span className="text-xs font-semibold text-emerald-600">
              🎤 Speak pocket depths (e.g. "three two four") or "bleeding" / "next" / "back".
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              Enable hands-free charting. Advance dental pocket depth and BOP recording using voice.
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastSaved ? (
            <span className="text-xs text-slate-500">Last saved: {lastSaved}</span>
          ) : null}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
          >
            {saving ? "Saving Chart..." : "Save Perio Chart"}
          </button>
        </div>
        {voiceError ? <p className="w-full text-xs font-semibold text-red-600 mt-1">{voiceError}</p> : null}
        {lastPhrase ? (
          <div className="w-full border-t border-slate-100 pt-2 mt-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Last Heard: </span>
            <span className="italic bg-slate-50 border border-slate-100 rounded px-2 py-0.5">"{lastPhrase}"</span>
          </div>
        ) : null}
      </div>

      {/* Grid Guide / Quick Reference */}
      <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-xs text-teal-800 flex flex-wrap gap-x-6 gap-y-2 justify-between">
        <div>
          <span className="font-bold">🎤 Supported Voice Commands:</span>
          <span className="ml-2">`1` to `10` (depths) • `bleeding` / `blood` (mark BOP) • `next` • `back` • `clear`</span>
        </div>
        <div>
          <span className="font-bold">Active Cell Indicator:</span>
          <span className="ml-2 border border-teal-600 bg-teal-50 px-1.5 py-0.5 rounded text-teal-800 font-medium">Buccal / Lingual Distal-Mid-Mesial</span>
        </div>
      </div>

      {/* The Dental Grid */}
      <div className="space-y-8 w-full">
        {/* UPPER ARCH (Teeth 1-16) */}
        <div className="space-y-3 w-full">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider pl-1">Upper Arch (Teeth 1 - 16)</h3>
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
            {upperArch.map((t) => (
              <ToothCard
                key={t.num}
                tooth={t}
                focus={focus}
                setFocus={setFocus}
                updateCellValue={updateCellValue}
                toggleCellBop={toggleCellBop}
              />
            ))}
          </div>
        </div>

        {/* LOWER ARCH (Teeth 17-32) */}
        <div className="space-y-3 w-full">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider pl-1">Lower Arch (Teeth 17 - 32)</h3>
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
            {lowerArch.map((t) => (
              <ToothCard
                key={t.num}
                tooth={t}
                focus={focus}
                setFocus={setFocus}
                updateCellValue={updateCellValue}
                toggleCellBop={toggleCellBop}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type ToothCardProps = {
  tooth: ToothData;
  focus: FocusState;
  setFocus: (f: FocusState) => void;
  updateCellValue: (toothNum: number, surface: "buccal" | "lingual", site: "distal" | "mid" | "mesial", val: number | "") => void;
  toggleCellBop: (toothNum: number, surface: "buccal" | "lingual", site: "distal" | "mid" | "mesial") => void;
};

function ToothCard({ tooth, focus, setFocus, updateCellValue, toggleCellBop }: ToothCardProps) {
  const isToothFocused = (surface: "buccal" | "lingual", site: "distal" | "mid" | "mesial") => {
    return focus.toothNum === tooth.num && focus.surface === surface && focus.site === site;
  };

  const renderInputs = (surface: "buccal" | "lingual") => {
    const sites: ("distal" | "mid" | "mesial")[] = ["distal", "mid", "mesial"];
    const values = surface === "buccal" ? tooth.buccal : tooth.lingual;
    const bopValues = surface === "buccal" ? tooth.bopBuccal : tooth.bopLingual;

    return (
      <div className="flex gap-0.5 justify-center">
        {sites.map((s) => {
          const val = values[s];
          const hasBop = bopValues[s];
          const isFocused = isToothFocused(surface, s);

          return (
            <div key={s} className="relative flex flex-col items-center">
              {/* Pocket Depth Input */}
              <input
                type="text"
                maxLength={2}
                value={val}
                onChange={(e) => {
                  const num = e.target.value.replace(/[^0-9]/g, "");
                  updateCellValue(tooth.num, surface, s, num ? parseInt(num) : "");
                }}
                onFocus={() => setFocus({ toothNum: tooth.num, surface, site: s })}
                className={`w-5 h-5 text-center text-[10px] font-semibold rounded outline-none border transition ${
                  isFocused
                    ? "border-teal-600 ring-2 ring-teal-500 text-teal-900"
                    : "border-slate-300 text-slate-800"
                } ${
                  hasBop
                    ? "bg-rose-100 border-rose-400 text-red-800 font-bold"
                    : isFocused
                    ? "bg-teal-50"
                    : val !== "" && val >= 4
                    ? "text-red-600 bg-red-50 border-red-200"
                    : "bg-white"
                }`}
              />

              {/* BOP Red Dot indicator */}
              <button
                type="button"
                onClick={() => toggleCellBop(tooth.num, surface, s)}
                className={`mt-0.5 w-1.5 h-1.5 rounded-full border transition ${
                  hasBop ? "bg-red-500 border-red-600 scale-110 shadow-sm" : "bg-slate-200 border-slate-300"
                }`}
                title="Bleeding on Probing"
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-1 shadow-sm w-full min-w-0">
      {/* Tooth Identifier */}
      <span className="text-center text-[10px] font-bold text-slate-900 mb-1 bg-slate-100 rounded py-0.5">
        #{tooth.num}
      </span>

      {/* Buccal Measurements (F/B) */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold text-slate-400 block text-center">B</span>
        {renderInputs("buccal")}
      </div>

      <div className="border-t border-dashed border-slate-200 my-1"></div>

      {/* Lingual Measurements (L) */}
      <div className="space-y-1">
        {renderInputs("lingual")}
        <span className="text-[9px] font-bold text-slate-400 block text-center">L</span>
      </div>
    </div>
  );
}
