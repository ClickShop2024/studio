"use client";

import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export function NotificationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenDialog = localStorage.getItem('seen-notification-dialog');
    if (!hasSeenDialog) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000); // Show after 2 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAction = (allow: boolean) => {
    setIsOpen(false);
    localStorage.setItem('seen-notification-dialog', 'true');
    if (allow) {
        toast({
            title: "¡Gracias!",
            description: "Te mantendremos al tanto de las novedades."
        })
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <BellRing className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">Activar notificaciones</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            ¿Quieres ser el primero en saber sobre nuestras novedades, ofertas exclusivas y lanzamientos de productos?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel onClick={() => handleAction(false)}>Ahora no</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleAction(true)}>Sí, activar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
