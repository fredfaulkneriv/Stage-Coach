// Cloudflare D1 REST API wrapper

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!
const DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID!
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!

const D1_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`

interface D1Result<T = Record<string, unknown>> {
  results: T[]
  success: boolean
  meta: {
    changed_db: boolean
    changes: number
    duration: number
    last_row_id: number
    rows_read: number
    rows_written: number
    size_after: number
  }
}

interface D1Response<T = Record<string, unknown>> {
  result: D1Result<T>[]
  success: boolean
  errors: { code: number; message: string }[]
  messages: string[]
}

export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null | boolean)[] = []
): Promise<T[]> {
  const response = await fetch(D1_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`D1 query failed: ${response.status} ${text}`)
  }

  const json: D1Response<T> = await response.json()

  if (!json.success || json.errors?.length > 0) {
    throw new Error(`D1 error: ${JSON.stringify(json.errors)}`)
  }

  return json.result[0]?.results ?? []
}

export async function d1Execute(
  sql: string,
  params: (string | number | null | boolean)[] = []
): Promise<{ changes: number; last_row_id: number }> {
  const response = await fetch(D1_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`D1 execute failed: ${response.status} ${text}`)
  }

  const json: D1Response = await response.json()

  if (!json.success || json.errors?.length > 0) {
    throw new Error(`D1 error: ${JSON.stringify(json.errors)}`)
  }

  const meta = json.result[0]?.meta
  return {
    changes: meta?.changes ?? 0,
    last_row_id: meta?.last_row_id ?? 0,
  }
}
