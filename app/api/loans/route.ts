import { Pool } from 'pg'
import { NextResponse } from 'next/server'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function GET(request: Request) {
  const phone = new URL(request.url).searchParams.get('phone')?.trim()
  if (!phone) return NextResponse.json({ error: 'Phone is required' }, { status: 400 })

  try {
    const result = await pool.query('SELECT id, friend_name AS "friendName", amount::float, due_date AS "dueDate", repaid_at IS NOT NULL AS repaid, receipt_url AS "receiptUrl" FROM loans WHERE phone = $1 ORDER BY due_date ASC', [phone])
    const loans = result.rows
    const summary = { totalLent: loans.reduce((sum, loan) => sum + loan.amount, 0), totalRepaid: loans.filter((loan) => loan.repaid).reduce((sum, loan) => sum + loan.amount, 0), overdueAmount: loans.filter((loan) => !loan.repaid && new Date(loan.dueDate) < new Date()).reduce((sum, loan) => sum + loan.amount, 0) }
    return NextResponse.json({ loans, summary })
  } catch {
    return NextResponse.json({ error: 'Unable to load ledger' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  if (typeof body.phone !== 'string' || typeof body.friendName !== 'string' || !Number.isFinite(Number(body.amount)) || Number(body.amount) <= 0 || typeof body.dueDate !== 'string') return NextResponse.json({ error: 'Invalid loan entry' }, { status: 400 })
  const result = await pool.query('INSERT INTO loans (phone, friend_name, amount, due_date, receipt_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, friend_name AS "friendName", amount::float, due_date AS "dueDate", false AS repaid, receipt_url AS "receiptUrl"', [body.phone, body.friendName.trim(), Number(body.amount), body.dueDate, body.receiptUrl ?? null])
  return NextResponse.json(result.rows[0], { status: 201 })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  if (typeof body.id !== 'string' || typeof body.phone !== 'string') return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const result = await pool.query('UPDATE loans SET repaid_at = NOW() WHERE id = $1 AND phone = $2 RETURNING id', [body.id, body.phone])
  if (!result.rowCount) return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
