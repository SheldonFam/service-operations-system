import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface OrderRow {
  id: string
  order_no: string
  customer_name: string
  service_type: string
  status: string
  quoted_price: number
  created_at: string
  updated_at: string
  postpone_count: number
  technician: { id: string; name: string } | null
  service_record: {
    work_done: string
    final_amount: number
    completed_at: string
  }[] | null
}

async function fetchContextData() {
  // Fetch recent orders with technician + service record
  const { data: orders } = await supabase
    .from('orders')
    .select(
      'id, order_no, customer_name, service_type, status, quoted_price, created_at, updated_at, postpone_count, technician:users!assigned_technician(id, name), service_record:service_records(work_done, final_amount, completed_at)',
    )
    .order('created_at', { ascending: false })
    .limit(200)

  // Fetch technicians
  const { data: technicians } = await supabase
    .from('users')
    .select('id, name, branch')
    .eq('role', 'technician')
    .order('name')

  // Flatten service_record arrays to single objects
  const cleanOrders = ((orders as OrderRow[] | null) ?? []).map((o) => ({
    ...o,
    service_record:
      Array.isArray(o.service_record) && o.service_record.length > 0
        ? o.service_record[0]
        : null,
  }))

  return { orders: cleanOrders, technicians: technicians ?? [] }
}

const SYSTEM_PROMPT = `You are an operations assistant for Sejuk Sejuk Service, an air-conditioner service company in Malaysia.

You answer questions about service operations based ONLY on the data provided below. If the data doesn't contain enough information to answer, say so clearly.

Keep responses concise and formatted clearly. Use order numbers (e.g. ORD-20260328-001) when referencing specific jobs. Format currency as RM.

Today's date is ${new Date().toISOString().split('T')[0]}.

When calculating time periods:
- "today" = orders from today's date
- "this week" = last 7 days
- "last week" = 7-14 days ago
- "this month" = last 30 days`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { question } = req.body

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required' })
  }

  try {
    const { orders, technicians } = await fetchContextData()

    const dataContext = `
TECHNICIANS:
${JSON.stringify(technicians, null, 2)}

ORDERS (most recent 200):
${JSON.stringify(orders, null, 2)}
`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `DATA:\n${dataContext}` },
      { text: `USER QUESTION: ${question}` },
    ])

    const response = result.response.text()

    return res.status(200).json({ answer: response })
  } catch (error) {
    console.error('AI query error:', error)
    return res
      .status(500)
      .json({ error: 'Failed to process your question. Please try again.' })
  }
}
