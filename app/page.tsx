'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, Check, ChevronRight, CircleDollarSign, Clock3, Plus, ReceiptText, ShieldCheck, Smartphone, X } from 'lucide-react'

type Loan = { id: string; friendName: string; amount: number; dueDate: string; repaid: boolean }

const initialLoans: Loan[] = [
  { id: '1', friendName: 'Alex Morgan', amount: 240, dueDate: '2024-11-08', repaid: false },
  { id: '2', friendName: 'Jamie Chen', amount: 85, dueDate: '2024-11-02', repaid: false },
  { id: '3', friendName: 'Taylor Reed', amount: 120, dueDate: '2024-10-18', repaid: true },
]

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
const prettyDate = (value: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`))

export default function Page() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loans, setLoans] = useState(initialLoans)
  const [showForm, setShowForm] = useState(false)
  const [friend, setFriend] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [sent, setSent] = useState(false)

  const summary = useMemo(() => ({
    lent: loans.reduce((sum, loan) => sum + loan.amount, 0),
    repaid: loans.filter((loan) => loan.repaid).reduce((sum, loan) => sum + loan.amount, 0),
    overdue: loans.filter((loan) => !loan.repaid && new Date(loan.dueDate) < new Date()).reduce((sum, loan) => sum + loan.amount, 0),
  }), [loans])

  if (!authenticated) return <Login phone={phone} setPhone={setPhone} otp={otp} setOtp={setOtp} sent={sent} onSend={() => setSent(true)} onVerify={() => otp.length === 4 && setAuthenticated(true)} />

  const addLoan = (event: React.FormEvent) => {
    event.preventDefault()
    if (!friend.trim() || !amount || !dueDate) return
    setLoans((current) => [{ id: crypto.randomUUID(), friendName: friend.trim(), amount: Number(amount), dueDate, repaid: false }, ...current])
    setFriend(''); setAmount(''); setDueDate(''); setShowForm(false)
  }

  return <main className="min-h-screen bg-[#f5f6f3] text-[#17231f]">
    <div className="mx-auto max-w-6xl px-5 py-7 md:px-10 md:py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#d7e8d3] text-[#275943]"><CircleDollarSign /></div><div><p className="text-lg font-semibold tracking-tight">MiniLedger</p><p className="text-xs text-[#718078]">Keep friendships comfortable.</p></div></div>
        <button onClick={() => setAuthenticated(false)} className="rounded-full border border-[#dfe5df] bg-white px-4 py-2 text-sm font-medium text-[#607068] transition hover:bg-[#eef3ee]">Sign out</button>
      </header>
      <section className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div><p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e4f0e0] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#39704f]"><ShieldCheck size={14} /> Private by default</p><h1 className="max-w-xl text-4xl font-semibold leading-[1.06] tracking-[-0.04em] md:text-6xl">A clearer way to keep track of <span className="text-[#3b7955]">kindness.</span></h1><p className="mt-5 max-w-lg text-base leading-7 text-[#6b7971]">A simple, friendly record of what you&apos;ve lent, what&apos;s been returned, and what needs a gentle nudge.</p></div>
        <div className="rounded-[2rem] bg-[#224a36] p-6 text-white shadow-[0_20px_50px_-30px_#173425] md:p-8"><div className="flex items-start justify-between"><div><p className="text-sm text-[#b9d1bf]">Outstanding balance</p><p className="mt-3 text-5xl font-semibold tracking-[-0.05em]">{money(summary.lent - summary.repaid)}</p></div><div className="rounded-full bg-white/10 p-3"><ArrowUpRight /></div></div><div className="mt-10 flex items-center justify-between border-t border-white/15 pt-4 text-sm"><span className="text-[#b9d1bf]">Across {loans.length} entries</span><span className="flex items-center gap-1 font-medium text-[#d9ebd5]"><Clock3 size={15} /> {money(summary.overdue)} overdue</span></div></div>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-3"><Stat label="Total lent" value={money(summary.lent)} icon={<ArrowUpRight />} /><Stat label="Total repaid" value={money(summary.repaid)} icon={<Check />} /><Stat label="Overdue" value={money(summary.overdue)} icon={<Clock3 />} warn /></section>
      <section className="mt-12"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold tracking-tight">Your ledger</h2><p className="mt-1 text-sm text-[#7a877f]">Everything in one calm place.</p></div><button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-full bg-[#2e6b49] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24583b]"><Plus size={17} /> Add entry</button></div>
        <div className="overflow-hidden rounded-3xl border border-[#e0e6df] bg-white"><div className="divide-y divide-[#edf0ed]">{loans.map((loan) => { const overdue = !loan.repaid && new Date(loan.dueDate) < new Date(); return <div key={loan.id} className={`flex flex-wrap items-center gap-4 px-5 py-5 md:px-7 ${overdue ? 'bg-[#fffaf3]' : ''}`}><div className={`flex size-11 items-center justify-center rounded-2xl text-sm font-bold ${overdue ? 'bg-[#f8e6c8] text-[#9a6a2d]' : 'bg-[#e6f0e2] text-[#39704f]'}`}>{loan.friendName.split(' ').map((n) => n[0]).join('')}</div><div className="min-w-[150px] flex-1"><p className="font-semibold">{loan.friendName}</p><p className={`mt-1 text-sm ${overdue ? 'font-medium text-[#b17632]' : 'text-[#7c887f]'}`}>{loan.repaid ? `Repaid · ${prettyDate(loan.dueDate)}` : overdue ? `Overdue · due ${prettyDate(loan.dueDate)}` : `Due ${prettyDate(loan.dueDate)}`}</p></div><p className="text-lg font-semibold">{money(loan.amount)}</p>{loan.repaid ? <span className="rounded-full bg-[#e7f2e4] px-3 py-1 text-xs font-semibold text-[#3f7651]">Repaid</span> : <button onClick={() => setLoans((current) => current.map((item) => item.id === loan.id ? { ...item, repaid: true } : item))} className="flex items-center gap-1 rounded-full border border-[#c9d9ca] px-3 py-1.5 text-xs font-semibold text-[#39704f] transition hover:bg-[#edf5eb]">Mark repaid <ChevronRight size={14} /></button>}</div> })}</div></div>
      </section>
    </div>
    {showForm && <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#142019]/30 p-5 backdrop-blur-sm"><form onSubmit={addLoan} className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"><div className="mb-7 flex items-center justify-between"><div><h2 className="text-2xl font-semibold tracking-tight">New entry</h2><p className="mt-1 text-sm text-[#79867e]">Record a loan in a few details.</p></div><button type="button" onClick={() => setShowForm(false)} className="rounded-full p-2 text-[#819087] hover:bg-[#f1f4f0]"><X /></button></div><div className="flex flex-col gap-5"><label className="text-sm font-medium">Friend name<input value={friend} onChange={(e) => setFriend(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dce3dc] px-4 py-3 outline-none focus:border-[#4b8b63]" placeholder="e.g. Sam Lee" required /></label><label className="text-sm font-medium">Amount<input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dce3dc] px-4 py-3 outline-none focus:border-[#4b8b63]" placeholder="0.00" required /></label><label className="text-sm font-medium">Due date<input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dce3dc] px-4 py-3 outline-none focus:border-[#4b8b63]" required /></label></div><button className="mt-7 w-full rounded-xl bg-[#2e6b49] py-3 font-semibold text-white hover:bg-[#24583b]">Save entry</button></form></div>}
  </main>
}

function Stat({ label, value, icon, warn = false }: { label: string; value: string; icon: React.ReactNode; warn?: boolean }) { return <div className={`rounded-2xl border p-5 ${warn ? 'border-[#f0dfc2] bg-[#fffaf3]' : 'border-[#e0e6df] bg-white'}`}><div className={`mb-5 flex size-9 items-center justify-center rounded-xl ${warn ? 'bg-[#f8e6c8] text-[#a26f32]' : 'bg-[#edf4eb] text-[#39704f]'}`}>{icon}</div><p className="text-sm text-[#7a877f]">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p></div> }

function Login({ phone, setPhone, otp, setOtp, sent, onSend, onVerify }: { phone: string; setPhone: (v: string) => void; otp: string; setOtp: (v: string) => void; sent: boolean; onSend: () => void; onVerify: () => void }) { return <main className="flex min-h-screen items-center justify-center bg-[#f5f6f3] px-5 text-[#17231f]"><div className="w-full max-w-md"><div className="mb-10 flex items-center justify-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-[#d7e8d3] text-[#275943]"><CircleDollarSign /></div><span className="text-xl font-semibold">MiniLedger</span></div><div className="rounded-[2rem] border border-[#e1e7e0] bg-white p-7 shadow-[0_20px_60px_-40px_#173425] md:p-9"><p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#4d8060]">Welcome back</p><h1 className="text-3xl font-semibold tracking-[-0.04em]">Your money, remembered.</h1><p className="mt-3 text-sm leading-6 text-[#77847b]">Sign in with your phone number. We&apos;ll send a one-time code to verify it&apos;s you.</p>{!sent ? <div className="mt-8 flex flex-col gap-4"><label className="text-sm font-medium">Phone number<div className="mt-2 flex items-center rounded-xl border border-[#dce3dc] px-4 focus-within:border-[#4b8b63]"><Smartphone size={18} className="text-[#8a978f]" /><input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border-0 px-3 py-3 outline-none" placeholder="(555) 123-4567" type="tel" /></div></label><button onClick={onSend} disabled={phone.length < 7} className="mt-2 rounded-xl bg-[#2e6b49] py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Send code</button></div> : <div className="mt-8 flex flex-col gap-4"><label className="text-sm font-medium">Enter your 4-digit code<input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} className="mt-2 w-full rounded-xl border border-[#dce3dc] px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-[#4b8b63]" placeholder="0000" inputMode="numeric" /></label><p className="rounded-xl bg-[#f3f7f1] px-4 py-3 text-xs leading-5 text-[#617268]">Demo mode: the OTP is printed in the server log. Use <strong>1234</strong> here.</p><button onClick={onVerify} className="rounded-xl bg-[#2e6b49] py-3.5 font-semibold text-white">Open my ledger</button></div>}<p className="mt-8 flex items-center justify-center gap-2 text-xs text-[#8a968e]"><ReceiptText size={14} /> Your data stays private.</p></div></div></main> }
