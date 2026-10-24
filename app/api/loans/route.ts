import { Pool } from 'pg'
import { NextResponse } from 'next/server'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const phonePattern = /^[+\d\s().-]{7,24}$/
const maxFriendNameLength = 80

function isValidPhone(phone: unknown): phone is string {
  return typeof phone === 'string' && phonePattern.test(phone.trim())
}

function isValidDate(value: unknown) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime())
}

export async function GET(request: Request) {
  const phone = new URL(request.url).searchParams.get('phone')?.trim()
  if (!isValidPhone(phone)) return NextResponse.json({ error: 'A valid phone number is required' }, { status: 400 })

  try {
    const result = await pool.query(`SELECT id, friend_name AS "friendName", amount::float, to_char(due_date, 'YYYY-MM-DD') AS "dueDate", repaid_at IS NOT NULL AS repaid, receipt_url AS "receiptUrl" FROM loans WHERE phone = $1 ORDER BY due_date ASC`, [phone])
    const loans = result.rows
    const summary = { totalLent: loans.reduce((sum, loan) => sum + loan.amount, 0), totalRepaid: loans.filter((loan) => loan.repaid).reduce((sum, loan) => sum + loan.amount, 0), overdueAmount: loans.filter((loan) => !loan.repaid && new Date(loan.dueDate) < new Date()).reduce((sum, loan) => sum + loan.amount, 0) }
    return NextResponse.json({ loans, summary })
  } catch {
    return NextResponse.json({ error: 'Unable to load ledger' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const friendName = typeof body.friendName === 'string' ? body.friendName.trim() : ''
  const amount = Number(body.amount)
  const receiptUrl = body.receiptUrl == null ? null : String(body.receiptUrl)
  if (!isValidPhone(phone) || !friendName || friendName.length > maxFriendNameLength || !Number.isFinite(amount) || amount <= 0 || amount > 100000000 || !isValidDate(body.dueDate) || (receiptUrl !== null && receiptUrl.length > 2048)) {
    return NextResponse.json({ error: 'Invalid loan entry' }, { status: 400 })
  }

  try {
    const result = await pool.query(`INSERT INTO loans (phone, friend_name, amount, due_date, receipt_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, friend_name AS "friendName", amount::float, to_char(due_date, 'YYYY-MM-DD') AS "dueDate", false AS repaid, receipt_url AS "receiptUrl"`, [phone, friendName, amount, body.dueDate, receiptUrl])
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to save loan' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const id = typeof body.id === 'string' ? body.id.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  if (!id || id.length > 100 || !isValidPhone(phone)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  try {
    const result = await pool.query('UPDATE loans SET repaid_at = NOW() WHERE id = $1 AND phone = $2 RETURNING id', [id, phone])
    if (!result.rowCount) return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to update loan' }, { status: 500 })
  }
}
