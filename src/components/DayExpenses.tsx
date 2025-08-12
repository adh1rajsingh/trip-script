"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import type { ExpenseInput } from "@/app/actions/expenses";
import { ChevronDown, ChevronRight, ReceiptText } from "lucide-react";

type Expense = {
  id: string;
  itineraryItemId: string | null;
  date: Date | string;
  amountCents: number;
  currency: string;
  category: string;
  note: string | null;
  receiptUrl: string | null;
};

type DayExpensesProps = {
  tripId: string;
  date: Date;
  baseCurrency: string;
  rateMap: Map<string, number>;
  expenses: Expense[];
  onAdd: (input: ExpenseInput) => Promise<{ success: boolean; error?: string; expense?: Expense }>;
  onDelete: (args: { expenseId: string; tripId: string }) => Promise<{ success: boolean; error?: string }>;
  places?: Array<{ id: string; name: string }>;
  onSetRate?: (args: { tripId: string; currency: string; rateToBase: number }) => Promise<{ success: boolean; error?: string }>;
};

export default function DayExpenses({ tripId, date, baseCurrency, rateMap, expenses, onAdd, onDelete, places = [], onSetRate }: DayExpensesProps) {
  const { showToast } = useToast();
  const [local, setLocal] = useState<Expense[]>(expenses);
  const [form, setForm] = useState({ amount: "", currency: baseCurrency, category: "Food & Drink", note: "", receiptUrl: "", itineraryItemId: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [rateInput, setRateInput] = useState<string>("");
  const [rateCurrency, setRateCurrency] = useState<string>("");
  const dayKey = new Date(date).toDateString();
  const storageKey = `trip.${tripId}.expenses.${dayKey}.open`;
  const [open, setOpen] = useState<boolean>(true);

  // Restore collapsed state per day
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "0") setOpen(false);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const toggleOpen = () => {
    setOpen((v) => {
      const next = !v;
      try { localStorage.setItem(storageKey, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const convert = useCallback((cents: number, currency: string) => {
    const rate = rateMap.get(currency.toUpperCase());
    if (!rate) return null;
    return Math.round(cents * rate);
  }, [rateMap]);

  const totalBase = useMemo(() => {
    let sum = 0;
    for (const e of local) {
      const conv = convert(e.amountCents, e.currency);
      if (conv != null) sum += conv;
    }
    return sum;
  }, [local, convert]);

  const missingCurrencies = useMemo(() => {
    const set = new Set<string>();
    for (const e of local) {
      const cur = e.currency.toUpperCase();
      if (cur !== baseCurrency.toUpperCase() && !rateMap.has(cur)) set.add(cur);
    }
    return Array.from(set);
  }, [local, rateMap, baseCurrency]);

  const fmt = (c: number, cur = baseCurrency) => `${cur} ${(c / 100).toFixed(2)}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount.trim()) return;
    const digits = form.amount.replace(/\D+/g, "");
    const units = digits === "" ? 0 : parseInt(digits, 10);
    const amountCents = Math.max(0, units * 100);
    if (amountCents <= 0) return;
    setSaving(true);
    try {
      const res = await onAdd({
        tripId,
        date,
        amountCents,
        currency: form.currency.toUpperCase(),
        category: form.category,
        note: form.note || null,
        receiptUrl: form.receiptUrl || null,
        itineraryItemId: form.itineraryItemId || null,
      });
      if (res.success) {
        if (res.expense) setLocal((l) => [...l, res.expense!]);
        setForm({ amount: "", currency: baseCurrency, category: form.category, note: "", receiptUrl: "", itineraryItemId: "" });
        showToast({ title: "Expense added", variant: "success" });
      } else {
        showToast({ title: "Failed to add expense", description: res.error, variant: "error" });
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await onDelete({ expenseId: id, tripId });
      if (res.success) {
        setLocal((l) => l.filter((e) => e.id !== id));
        showToast({ title: "Expense removed", variant: "success" });
      } else {
        showToast({ title: "Failed to remove", description: res.error, variant: "error" });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const setRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSetRate) return;
    const code = rateCurrency.trim().toUpperCase();
    const val = parseFloat(rateInput);
    if (!code || !isFinite(val) || val <= 0) return;
    const res = await onSetRate({ tripId, currency: code, rateToBase: val });
    if (res.success) {
      showToast({ title: "Rate saved", variant: "success" });
    } else {
      showToast({ title: "Failed to save rate", description: res.error, variant: "error" });
    }
  };

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      {/* Header */}
      <button type="button" onClick={toggleOpen} className="w-full px-4 py-3 flex items-center gap-3 justify-between text-left">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          <span className="text-sm font-semibold text-gray-800">Expenses</span>
          {missingCurrencies.length > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800">rates needed</span>
          )}
        </div>
        <div className="text-xs text-gray-700 flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-gray-400" />
          <span>Total ({baseCurrency}):</span>
          <span className="font-medium">{fmt(totalBase)}</span>
        </div>
      </button>

      {/* Content */}
      {open && (
        <div className="px-4 pb-4">
          {missingCurrencies.length > 0 && (
            <div className="mb-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
              Missing rates: {missingCurrencies.join(', ')}. Set rate to {baseCurrency} below.
            </div>
          )}

          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600">Amount</label>
              <input className="border rounded px-2 py-1" placeholder="0" inputMode="numeric" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600">Currency</label>
              <input className="border rounded px-2 py-1" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))} />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600">Category</label>
              <select className="border rounded px-2 py-1" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {["Lodging","Food & Drink","Transport","Activities","Shopping","Fees","Misc"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {places.length > 0 && (
              <div className="flex flex-col sm:col-span-2 lg:col-span-1">
                <label className="text-xs text-gray-600">Place</label>
                <select className="border rounded px-2 py-1" value={form.itineraryItemId} onChange={(e) => setForm((f) => ({ ...f, itineraryItemId: e.target.value }))}>
                  <option value="">(none)</option>
                  {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex flex-col sm:col-span-2">
              <label className="text-xs text-gray-600">Note</label>
              <input className="border rounded px-2 py-1" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
            </div>
            <div className="flex flex-col sm:col-span-2 lg:col-span-1">
              <label className="text-xs text-gray-600">Receipt URL</label>
              <input className="border rounded px-2 py-1" placeholder="https://..." value={form.receiptUrl} onChange={(e) => setForm((f) => ({ ...f, receiptUrl: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <button type="submit" disabled={saving} className="w-full sm:w-auto h-9 px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50 disabled:opacity-50">{saving ? "Adding..." : "Add expense"}</button>
            </div>
          </form>

          {onSetRate && (
            <form onSubmit={setRate} className="flex flex-wrap items-end gap-2 mb-4">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600">Rate currency</label>
                <input className="border rounded px-2 py-1 w-24" placeholder="EUR" value={rateCurrency} onChange={(e) => setRateCurrency(e.target.value.toUpperCase())} />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600">1 CUR = ? {baseCurrency}</label>
                <input className="border rounded px-2 py-1 w-32" placeholder="1.08" value={rateInput} onChange={(e) => setRateInput(e.target.value)} />
              </div>
              <button type="submit" className="h-9 px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50">Save rate</button>
            </form>
          )}

          <ul className="divide-y">
            {local.map((e) => {
              const conv = convert(e.amountCents, e.currency);
              return (
                <li key={e.id} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-gray-800 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] border border-gray-200">{e.category}</span>
                      {e.note && <span className="truncate">{e.note}</span>}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {e.currency.toUpperCase()} {(e.amountCents/100).toFixed(2)} {conv != null && (
                        <span className="ml-2">• {baseCurrency} {(conv/100).toFixed(2)}</span>
                      )}
                      {e.receiptUrl && (
                        <a href={e.receiptUrl} target="_blank" rel="noreferrer" className="ml-2 underline">Receipt</a>
                      )}
                    </div>
                  </div>
                  <button onClick={() => remove(e.id)} disabled={deletingId===e.id} className="text-xs px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">{deletingId===e.id?"Removing...":"Remove"}</button>
                </li>
              );
            })}
            {local.length === 0 && <li className="py-2 text-sm text-gray-500">No expenses yet</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
