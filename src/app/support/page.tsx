
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface SupportRequest {
  id: string;
  date: string;
  reason: string;
  message: string;
  status: 'Pendiente' | 'En Proceso' | 'Respondido';
}

const faqs = [
    {
        question: "¿Cómo me registro en la aplicación?",
        answer: "Puedes registrarte haciendo clic en 'Iniciar Sesión' y luego en el enlace 'Regístrate'. Completa el formulario con tu nombre, correo electrónico y contraseña. Si eres un empleado o administrador, selecciona tu rol y proporciona la clave secreta correspondiente."
    },
    {
        question: "¿Cómo puedo ver los productos?",
        answer: "El catálogo principal se encuentra en la página de inicio. Puedes navegar por todos los productos, usar la barra de búsqueda para encontrar algo específico o filtrar por categorías como 'Ropa femenina', 'Accesorios', etc."
    },
    {
        question: "¿Cómo funcionan los pagos?",
        answer: "Actualmente, el proceso de pago se finaliza a través de un asesor de ventas. Cuando añades productos a tu carrito y procedes, nuestros asesores te contactarán para coordinar el pago y la entrega."
    },
    {
        question: "¿Cuál es el tiempo de entrega?",
        answer: "El tiempo de entrega varía según tu ubicación. Una vez que confirmes tu pedido con un asesor, te proporcionarán un tiempo estimado de entrega. Generalmente, es de 2 a 5 días hábiles."
    },
    {
        question: "¿Puedo devolver un producto?",
        answer: "Sí, aceptamos devoluciones dentro de los 7 días posteriores a la recepción del producto, siempre que esté en su estado original con las etiquetas puestas. Por favor, contacta a soporte para iniciar el proceso de devolución."
    }
]

export default function SupportPage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  
  const [contactReason, setContactReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
        const storedRequests = localStorage.getItem(`support-requests-${user.id}`);
        if (storedRequests) {
            setRequests(JSON.parse(storedRequests));
        }
    }
  }, [user, isAuthenticated]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactReason || !message) {
        toast({
            title: "Campos incompletos",
            description: "Por favor, selecciona un motivo y escribe tu mensaje.",
            variant: "destructive"
        });
        return;
    }

    const newRequest: SupportRequest = {
        id: crypto.randomUUID(),
        date: new Date().toLocaleDateString('es-ES'),
        reason: contactReason,
        message,
        status: 'Pendiente'
    };

    const updatedRequests = [...requests, newRequest];
    setRequests(updatedRequests);

    if (user) {
        localStorage.setItem(`support-requests-${user.id}`, JSON.stringify(updatedRequests));
    }
    
    // Simulate sending email
    console.log("Simulating email sent to uzziel.mare@gmail.com and clickshop.empresa@gmail.com");
    console.log("Form data:", { name: user?.name, email: user?.email, reason: contactReason, message });

    toast({
      title: "Solicitud enviada",
      description: "Hemos recibido tu mensaje. Te responderemos pronto.",
    });

    setContactReason('');
    setMessage('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Soporte Técnico</h1>
        <p className="text-muted-foreground mt-2">¿Necesitas ayuda? Contáctanos o consulta nuestras preguntas frecuentes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Formulario de Contacto</CardTitle>
                <CardDescription>Envíanos tus dudas, reclamos o sugerencias.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isAuthenticated ? (
                         <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre Completo</Label>
                                    <Input id="name" value={user?.name} readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input id="email" type="email" value={user?.email} readOnly />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="reason">Motivo de Contacto</Label>
                                <Select value={contactReason} onValueChange={setContactReason}>
                                    <SelectTrigger id="reason">
                                        <SelectValue placeholder="Selecciona un motivo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Duda">Duda</SelectItem>
                                        <SelectItem value="Reclamo">Reclamo</SelectItem>
                                        <SelectItem value="Sugerencia">Sugerencia</SelectItem>
                                        <SelectItem value="Soporte Técnico">Soporte Técnico</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Mensaje</Label>
                                <Textarea id="message" placeholder="Escribe tu mensaje aquí..." rows={5} value={message} onChange={e => setMessage(e.target.value)} />
                            </div>
                            <Button type="submit">Enviar Mensaje</Button>
                         </form>
                    ) : (
                        <div className="text-center text-muted-foreground p-8">
                            <p>Por favor, <a href="/login" className="text-primary underline">inicia sesión</a> para enviar una solicitud de soporte.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {isAuthenticated && requests.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Solicitudes</CardTitle>
                        <CardDescription>Aquí puedes ver el estado de tus solicitudes anteriores.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Mensaje</TableHead>
                                    <TableHead className="text-right">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.date}</TableCell>
                                    <TableCell>{req.reason}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{req.message}</TableCell>
                                    <TableCell className="text-right">
                                         <Badge 
                                            variant={req.status === 'Pendiente' ? 'secondary' : req.status === 'Respondido' ? 'default' : 'outline'}>
                                            {req.status}
                                         </Badge>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

        </div>

        <div className="space-y-8">
            <Card>
                 <CardHeader>
                    <CardTitle>Horario de Atención</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Nuestro equipo responde de lunes a viernes entre 9:00 a.m. y 6:00 p.m. ¡Gracias por tu paciencia!
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preguntas Frecuentes (FAQ)</CardTitle>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
