"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { updateStaffAppointment, type StaffApptState } from "./actions";

type DentistOption = { id: string; name: string | null; email: string };
type FamilyOpt = { id: string; firstName: string; lastName: string };

type Initial = {
  id: string;
  patientSearch: string;
  patient: {
    id: string;
    name: string | null;
    chartNumber: string | null;
    email: string;
    phone?: string | null;
  };
  dentistId: string;
  familyMemberId: string | null;
  startAtLocal: string;
  status: string;
  isEmergency: boolean;
  reason: string | null;
  notes: string | null;
};

type Props = {
  initial: Initial;
  dentists: DentistOption[];
  familyMembers: FamilyOpt[];
};

const initialState: StaffApptState = {};

export function StaffEditForm({ initial, dentists, familyMembers }: Props) {
  const [state, formAction, pending] = useActionState(updateStaffAppointment, initialState);
  const [patientSearch, setPatientSearch] = useState(initial.patientSearch);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [familyOptions, setFamilyOptions] = useState<FamilyOpt[]>(familyMembers);
  const [searching, setSearching] = useState(false);
  const [matchedPatient, setMatchedPatient] = useState<{
    id: string;
    name: string | null;
    chartNumber: string | null;
    email: string;
    phone?: string | null;
  } | null>(initial.patient);

  useEffect(() => {
    const raw = patientSearch.trim();
    if (raw.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Skip query if current search matches the selected patient details exactly
    if (
      matchedPatient &&
      (raw === matchedPatient.chartNumber ||
        raw === matchedPatient.name ||
        raw === matchedPatient.email)
    ) {
      return;
    }

    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/staff/patient-family?search=${encodeURIComponent(raw)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.patients ?? []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [patientSearch, matchedPatient]);

  const handleSelectPatient = async (p: any) => {
    setMatchedPatient(p);
    setPatientSearch(p.chartNumber || p.name || p.email);
    setSearchResults([]);
    setShowDropdown(false);

    // Fetch family members for the selected patient
    try {
      const res = await fetch(`/api/staff/patient-family?patientId=${p.id}`);
      if (res.ok) {
        const data = await res.json();
        setFamilyOptions(data.members ?? []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const formData = new FormData(e.currentTarget);
        const status = formData.get("status");
        if (status === "CANCELLED") {
          if (!confirm("Are you sure you want to cancel this appointment?")) {
            e.preventDefault();
          }
        }
      }}
      className="space-y-6"
    >
      <input type="hidden" name="id" value={initial.id} />
      {state.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div className="relative">
        <label htmlFor="patientSearch" className="block text-sm font-medium text-slate-700">
          Patient Name or Chart Number
        </label>
        <div className="relative">
          <input
            id="patientSearch"
            name="patientSearch"
            type="text"
            required
            autoComplete="off"
            value={patientSearch}
            onChange={(e) => {
              setPatientSearch(e.target.value);
              if (matchedPatient) {
                setMatchedPatient(null);
                setFamilyOptions([]);
              }
            }}
            placeholder="Type name, email or chart number..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
          />
          {searching && (
            <span className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
          )}
        </div>

        {/* Dropdown Options List */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {searchResults.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPatient(p)}
                className="flex w-full flex-col px-4 py-2 text-left hover:bg-teal-50 transition border-b border-slate-50 last:border-0"
              >
                <span className="font-semibold text-slate-800">{p.name || "Unnamed"}</span>
                <span className="text-xs text-slate-500">
                  {p.chartNumber ? `Chart: #${p.chartNumber}` : "No Chart"} • {p.email}
                </span>
              </button>
            ))}
          </div>
        )}

        {showDropdown && searchResults.length === 0 && !searching && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-lg ring-1 ring-black ring-opacity-5">
            No patients match that term. Try spelling their full name or unique chart number.
          </div>
        )}

        {/* Selected Patient Demographics Card */}
        {matchedPatient && (
          <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm shadow-sm transition">
            <h4 className="font-bold text-teal-900 mb-2">Selected Patient Demographics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="font-semibold text-slate-500 block text-xs uppercase">Name</span> 
                <span className="font-medium text-slate-900">{matchedPatient.name || "N/A"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block text-xs uppercase">Chart Number</span> 
                <span className="font-medium text-slate-950">{matchedPatient.chartNumber ? `#${matchedPatient.chartNumber}` : "N/A"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-slate-500 block text-xs uppercase">Email Address</span> 
                <span className="font-medium text-slate-900">{matchedPatient.email}</span>
              </div>
              {matchedPatient.phone && (
                <div className="sm:col-span-2">
                  <span className="font-semibold text-slate-500 block text-xs uppercase">Phone Number</span> 
                  <span className="font-medium text-slate-900">{matchedPatient.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="familyMemberId" className="block text-sm font-medium text-slate-700">
          Visit for
        </label>
        <select
          id="familyMemberId"
          name="familyMemberId"
          defaultValue={initial.familyMemberId ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        >
          <option value="">Account holder</option>
          {familyOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="dentistId" className="block text-sm font-medium text-slate-700">
          Dentist
        </label>
        <select
          id="dentistId"
          name="dentistId"
          required
          defaultValue={initial.dentistId}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        >
          {dentists.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name?.trim() || d.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="startAt" className="block text-sm font-medium text-slate-700">
          Date & time
        </label>
        <input
          id="startAt"
          name="startAt"
          type="datetime-local"
          required
          defaultValue={initial.startAtLocal}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={initial.status}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        >
          <option value="SCHEDULED">Scheduled</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
          <option value="NO_SHOW">No show</option>
        </select>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <input
          id="isEmergency"
          name="isEmergency"
          type="checkbox"
          defaultChecked={initial.isEmergency}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
        />
        <label htmlFor="isEmergency" className="text-sm font-medium text-slate-900">
          Emergency / urgent
        </label>
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-slate-700">
          Reason <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={2}
          defaultValue={initial.reason ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Internal notes <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={initial.notes ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href="/staff/dashboard"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Back
        </Link>
      </div>
    </form>
  );
}
