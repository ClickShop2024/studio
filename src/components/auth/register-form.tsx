"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User, Gender, Role } from "@/lib/types"

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor ingresa un email válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  role: z.enum(["Customer", "Employee", "Administrator"]),
  secretKey: z.string().optional(),
  size: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
}).refine(data => {
  if (data.role === "Employee" && data.secretKey !== "empleadovip2024") return false
  return true
}, {
  message: "Clave de empleado incorrecta.",
  path: ["secretKey"],
}).refine(data => {
  if (data.role === "Administrator" && data.secretKey !== "superadmin2024") return false
  return true
}, {
  message: "Clave de administrador incorrecta.",
  path: ["secretKey"],
})

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "Customer",
      secretKey: "",
    },
  })

  const selectedRole = form.watch("role")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, values.email, values.password)
      const newUser: User = {
        id: cred.user.uid,
        name: values.name,
        email: values.email,
        role: values.role as Role,
        size: values.size,
        gender: values.gender as Gender,
        status: "active",
        lastLogin: new Date().toISOString(),
      }

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        size: newUser.size,
        gender: newUser.gender,
        status: "active",
        creadoEn: Date.now(),
        lastLogin: newUser.lastLogin,
      })

      const loginSuccess = login(newUser)
      if (loginSuccess) {
        toast({
          title: "Registro exitoso",
          description: `¡Bienvenido, ${newUser.name}!`,
        })
        router.push(newUser.role === "Administrator" || newUser.role === "Employee" ? "/dashboard" : "/")
      }
    } catch (error) {
      toast({
        title: "Error al registrar",
        description: (error as Error).message || "Ocurrió un problema inesperado.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Crear una cuenta</CardTitle>
        <CardDescription>Ingresa tus datos para registrarte.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl><Input placeholder="Tu Nombre" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input placeholder="nombre@ejemplo.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Customer">Cliente</SelectItem>
                    <SelectItem value="Employee">Empleado</SelectItem>
                    <SelectItem value="Administrator">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {(selectedRole === "Employee" || selectedRole === "Administrator") && (
              <FormField control={form.control} name="secretKey" render={({ field }) => (
                <FormItem>
                  <FormLabel>Clave Secreta</FormLabel>
                  <FormControl><Input type="password" placeholder="Clave de acceso" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            {selectedRole === "Customer" && (
              <>
                <FormField control={form.control} name="size" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Talla (Opcional)</FormLabel>
                    <FormControl><Input placeholder="Ej: M, 32, 40" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu sexo" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Femenino</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            )}
            <Button type="submit" className="w-full">
              Crear Cuenta
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="underline text-primary">Inicia sesión</Link>
        </div>
      </CardContent>
    </Card>
  )
}