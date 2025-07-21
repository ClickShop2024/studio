import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const data = await req.json()
  const user = data.user // Aquí deberías validar primero

  cookies().set("clickshop-session", encodeURIComponent(JSON.stringify(user)))
  return NextResponse.json({ success: true })
}