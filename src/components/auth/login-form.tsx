"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/types"

const formSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un email válido." }),
  password: z.string().min(1, { message: "La contraseña es requerida." }),
})

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const storedUser = localStorage.getItem(`user-${values.email}`);

    if (storedUser) {
        const user: User = JSON.parse(storedUser);
        const loginSuccess = login(user);
        
        if (loginSuccess) {
            toast({
                title: "Inicio de sesión exitoso",
                description: `Bienvenido de nuevo, ${user.name}!`,
            });
            if (user.role === 'Administrator' || user.role === 'Employee') {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        } else {
            // This happens if the user is blocked
             toast({
                title: "Acceso denegado",
                description: "Tu cuenta ha sido bloqueada por el administrador. Para más información, contáctanos.",
                variant: "destructive",
            });
        }
    } else {
        toast({
            title: "Error de inicio de sesión",
            description: "Email o contraseña incorrectos.",
            variant: "destructive",
        })
        form.setError("email", { message: " " });
        form.setError("password", { message: "Email o contraseña incorrectos." });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tu email para acceder a tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="underline text-primary">
            Regístrate
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
