import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import type { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const session = cookies().get("clickshop-session")
  const rawData = session?.value ? JSON.parse(decodeURIComponent(session.value)) : null
  const role = rawData?.role

  if (!role || (role !== "Administrator" && role !== "Employee")) {
    redirect("/") // Protege la ruta
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar opcional aquí */}
      <aside className="w-64 bg-muted p-4 hidden md:block">
        <nav className="space-y-2">
          <a href="/dashboard/users" className="block text-sm font-medium text-primary">👥 Usuarios</a>
          {/* Puedes agregar más rutas aquí */}
        </nav>
      </aside>

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}