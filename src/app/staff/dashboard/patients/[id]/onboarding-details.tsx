"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FamilyMember = {
  id: string;
  firstName: string;
  lastName: string;
  dob: string | Date | null;
  relationship: string | null;
};

type Insurance = {
  id: string;
  carrierName: string;
  planName: string | null;
  memberId: string;
  groupNumber: string | null;
  subscriberName: string | null;
  effectiveDate: string | Date | null;
  notes: string | null;
};

type PatientData = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  chartNumber: string | null;
  familyMembers: FamilyMember[];
  insurances: Insurance[];
};

type Props = {
  patient: PatientData;
  appointments?: any[];
  latestPerio?: any;
};

export function OnboardingDetails({ patient, appointments = [], latestPerio = null }: Props) {
  const router = useRouter();

  // Basic Profile States
  const [name, setName] = useState(patient.name ?? "");
  const [phone, setPhone] = useState(patient.phone ?? "");
  const [chartNumber, setChartNumber] = useState(patient.chartNumber ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: "", type: "" });

  // Insurance States
  const initialInsurance = patient.insurances[0] ?? null;
  const [carrierName, setCarrierName] = useState(initialInsurance?.carrierName ?? "");
  const [planName, setPlanName] = useState(initialInsurance?.planName ?? "");
  const [memberId, setMemberId] = useState(initialInsurance?.memberId ?? "");
  const [groupNumber, setGroupNumber] = useState(initialInsurance?.groupNumber ?? "");
  const [subscriberName, setSubscriberName] = useState(initialInsurance?.subscriberName ?? "");
  const [effectiveDate, setEffectiveDate] = useState(() => {
    if (!initialInsurance?.effectiveDate) return "";
    const date = new Date(initialInsurance.effectiveDate);
    return date.toISOString().split("T")[0];
  });
  const [insuranceNotes, setInsuranceNotes] = useState(initialInsurance?.notes ?? "");
  const [insuranceSaving, setInsuranceSaving] = useState(false);
  const [insuranceMessage, setInsuranceMessage] = useState({ text: "", type: "" });

  // Family Members States
  const [familyList, setFamilyList] = useState<FamilyMember[]>(patient.familyMembers ?? []);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [relationship, setRelationship] = useState("");
  const [familySaving, setFamilySaving] = useState(false);
  const [familyMessage, setFamilyMessage] = useState({ text: "", type: "" });

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage({ text: "", type: "" });

    try {
      const res = await fetch(`/api/staff/patients/${patient.id}/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, chartNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMessage({ text: data.error || "Failed to update profile", type: "error" });
      } else {
        setProfileMessage({ text: "Profile updated successfully!", type: "success" });
        router.refresh(); // Update the main page header
      }
    } catch (err) {
      console.error(err);
      setProfileMessage({ text: "Something went wrong", type: "error" });
    } finally {
      setProfileSaving(false);
    }
  };

  // Save Insurance Handler
  const handleSaveInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    setInsuranceSaving(true);
    setInsuranceMessage({ text: "", type: "" });

    try {
      const res = await fetch(`/api/staff/patients/${patient.id}/insurance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrierName,
          planName,
          memberId,
          groupNumber,
          subscriberName,
          effectiveDate: effectiveDate || null,
          notes: insuranceNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInsuranceMessage({ text: data.error || "Failed to save insurance", type: "error" });
      } else {
        setInsuranceMessage({ text: "Insurance plan saved successfully!", type: "success" });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setInsuranceMessage({ text: "Something went wrong", type: "error" });
    } finally {
      setInsuranceSaving(false);
    }
  };

  // Add Family Member Handler
  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setFamilySaving(true);
    setFamilyMessage({ text: "", type: "" });

    try {
      const res = await fetch(`/api/staff/patients/${patient.id}/family`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, dob: dob || null, relationship }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFamilyMessage({ text: data.error || "Failed to add member", type: "error" });
      } else {
        setFamilyMessage({ text: "Family member added successfully!", type: "success" });
        setFamilyList((prev) => [...prev, data.member]);
        setFirstName("");
        setLastName("");
        setDob("");
        setRelationship("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setFamilyMessage({ text: "Something went wrong", type: "error" });
    } finally {
      setFamilySaving(false);
    }
  };

  // Sort and filter appointments
  const sortedAppts = [...appointments].sort(
    (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
  );

  const pastAppts = sortedAppts.filter(
    (a) => new Date(a.startAt).getTime() < Date.now()
  );
  
  const futureAppts = sortedAppts.filter(
    (a) => new Date(a.startAt).getTime() >= Date.now()
  );

  const lastBooking = pastAppts[0] || null;
  const nextBooking = futureAppts[futureAppts.length - 1] || null;

  return (
    <div className="space-y-6">
      {/* Clinical & Booking History Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Clinical & Booking History</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Last Booking */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Last Booking
            </span>
            {lastBooking ? (
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(lastBooking.startAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  with <span className="font-medium text-slate-900">{lastBooking.dentist.name || lastBooking.dentist.email}</span>
                </p>
                {lastBooking.reason && (
                  <p className="text-xs text-slate-500 italic mt-0.5">"{lastBooking.reason}"</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No past bookings recorded.</p>
            )}
          </div>

          {/* Next Scheduled */}
          <div className="rounded-xl border border-teal-50 bg-teal-50/30 p-4">
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider block mb-1">
              Next Scheduled
            </span>
            {nextBooking ? (
              <div>
                <p className="text-sm font-semibold text-teal-900">
                  {new Date(nextBooking.startAt).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-teal-850 mt-1">
                  with <span className="font-medium">{nextBooking.dentist.name || nextBooking.dentist.email}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No upcoming appointments scheduled.</p>
            )}
          </div>

          {/* Latest Perio Chart */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Latest Periodontal Chart
            </span>
            {latestPerio ? (
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(latestPerio.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  recorded by <span className="font-medium text-slate-900">{latestPerio.author.name || latestPerio.author.email}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No periodontal recordings yet.</p>
            )}
          </div>
        </div>

        {/* past bookings list table */}
        {sortedAppts.length > 0 ? (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Appointment History Logs</h4>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2">Date & Time</th>
                    <th className="px-4 py-2">Dentist</th>
                    <th className="px-4 py-2">Reason</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                  {sortedAppts.map((appt) => (
                    <tr key={appt.id}>
                      <td className="px-4 py-2.5 font-medium">
                        {new Date(appt.startAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-2.5">
                        {appt.dentist.name || appt.dentist.email}
                      </td>
                      <td className="px-4 py-2.5 max-w-[12rem] truncate">
                        {appt.reason || <span className="text-slate-400">N/A</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          appt.status === "COMPLETED"
                            ? "bg-green-50 text-green-700"
                            : appt.status === "SCHEDULED" || appt.status === "CONFIRMED"
                            ? "bg-teal-50 text-teal-700"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        {/* Basic Profile Form */}
        <form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Patient Demographics</h3>

          {profileMessage.text ? (
            <p
              className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                profileMessage.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {profileMessage.text}
            </p>
          ) : null}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="chartNumber" className="block text-sm font-medium text-slate-700">
                Chart Number (Unique)
              </label>
              <input
                id="chartNumber"
                type="text"
                value={chartNumber}
                onChange={(e) => setChartNumber(e.target.value)}
                placeholder="e.g. CN-1029"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
            >
              {profileSaving ? "Saving..." : "Save Demographics"}
            </button>
          </div>
        </form>

        {/* Family Members Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Family & Dependents</h3>

          {familyList.length === 0 ? (
            <p className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
              No family members registered under this account.
            </p>
          ) : (
            <div className="mb-6 divide-y divide-slate-100 border-t border-slate-100">
              {familyList.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <span className="font-semibold text-slate-800">
                      {m.firstName} {m.lastName}
                    </span>
                    <span className="ml-2 text-xs text-slate-500 rounded bg-slate-100 px-1.5 py-0.5">
                      {m.relationship || "Dependent"}
                    </span>
                  </div>
                  {m.dob ? (
                    <span className="text-xs text-slate-500">
                      DOB: {new Date(m.dob).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {/* Quick Add Dependent Form */}
          <form onSubmit={handleAddFamily} className="mt-4 border-t border-slate-200 pt-5 space-y-4">
            <h4 className="text-sm font-semibold text-slate-800">Add Dependent Family Member</h4>

            {familyMessage.text ? (
              <p
                className={`rounded-lg border px-3 py-2 text-sm ${
                  familyMessage.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {familyMessage.text}
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-semibold text-slate-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-semibold text-slate-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dob" className="block text-xs font-semibold text-slate-700">
                  Date of Birth
                </label>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <div>
                <label htmlFor="relationship" className="block text-xs font-semibold text-slate-700">
                  Relationship
                </label>
                <input
                  id="relationship"
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Child, Spouse"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={familySaving}
                className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
              >
                {familySaving ? "Adding..." : "Add Family Member"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Insurance Profile Card */}
      <div>
        <form onSubmit={handleSaveInsurance} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Insurance Coverage</h3>

          {insuranceMessage.text ? (
            <p
              className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                insuranceMessage.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {insuranceMessage.text}
            </p>
          ) : null}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="carrierName" className="block text-sm font-medium text-slate-700">
                  Insurance Carrier
                </label>
                <input
                  id="carrierName"
                  type="text"
                  required
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  placeholder="e.g. Delta Dental"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="planName" className="block text-sm font-medium text-slate-700">
                  Plan Name / Type
                </label>
                <input
                  id="planName"
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. PPO Plus Premier"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="memberId" className="block text-sm font-medium text-slate-700">
                  Member / Subscriber ID
                </label>
                <input
                  id="memberId"
                  type="text"
                  required
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="groupNumber" className="block text-sm font-medium text-slate-700">
                  Group Number
                </label>
                <input
                  id="groupNumber"
                  type="text"
                  value={groupNumber}
                  onChange={(e) => setGroupNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subscriberName" className="block text-sm font-medium text-slate-700">
                Primary Subscriber Name
              </label>
              <input
                id="subscriberName"
                type="text"
                value={subscriberName}
                onChange={(e) => setSubscriberName(e.target.value)}
                placeholder="Name of policy holder"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="effectiveDate" className="block text-sm font-medium text-slate-700">
                Effective Date
              </label>
              <input
                id="effectiveDate"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                Insurance Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                value={insuranceNotes}
                onChange={(e) => setInsuranceNotes(e.target.value)}
                placeholder="Verification details, copays, deductibles..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ring-teal-600 focus:border-teal-600 focus:ring-2"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={insuranceSaving}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
            >
              {insuranceSaving ? "Saving..." : "Save Insurance Policy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}
