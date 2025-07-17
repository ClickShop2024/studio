
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, PlusCircle, Edit, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Offer, Product } from '@/lib/types';
import { products as initialProducts } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

const offerSchema = z.object({
  productId: z.string().min(1, 'Debes seleccionar un producto.'),
  discountPrice: z.coerce.number().positive('El precio de oferta debe ser mayor que cero.'),
  dateRange: z.object({
    from: z.date({ required_error: 'La fecha de inicio es obligatoria.' }),
    to: z.date({ required_error: 'La fecha de finalización es obligatoria.' }),
  }),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres.'),
});

export default function OffersManagementPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const form = useForm<z.infer<typeof offerSchema>>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      productId: '',
      discountPrice: 0,
      description: '',
      dateRange: { from: new Date(), to: new Date(new Date().setDate(new Date().getDate() + 7)) },
    },
  });

  useEffect(() => {
    const storedProducts = localStorage.getItem('click-shop-products');
    setProducts(storedProducts ? JSON.parse(storedProducts) : initialProducts);
    
    const storedOffers = localStorage.getItem('click-shop-offers');
    if (storedOffers) {
      const parsedOffers = JSON.parse(storedOffers).map((o: any) => ({
        ...o,
        startDate: new Date(o.startDate),
        endDate: new Date(o.endDate)
      }));
      setOffers(parsedOffers);
    }
  }, []);

  const selectedProduct = useMemo(() => {
    const productId = form.watch('productId');
    return products.find(p => p.id === productId);
  }, [form, products]);

  const onSubmit = (values: z.infer<typeof offerSchema>) => {
    const { productId, discountPrice, dateRange, description } = values;
    
    if (selectedProduct && discountPrice >= selectedProduct.price) {
        form.setError("discountPrice", { message: "El precio de oferta debe ser menor al original." });
        return;
    }
    
    const offerData: Omit<Offer, 'id'> = {
        productId,
        discountPrice,
        startDate: dateRange.from,
        endDate: dateRange.to,
        description,
    };

    let updatedOffers: Offer[];

    if (editingOffer) {
      updatedOffers = offers.map(o => o.id === editingOffer.id ? { ...o, ...offerData } : o);
      toast({ title: 'Oferta Actualizada', description: `La oferta para "${selectedProduct?.name}" ha sido actualizada.` });
    } else {
      const newOffer: Offer = { id: crypto.randomUUID(), ...offerData };
      updatedOffers = [...offers, newOffer];
      toast({ title: 'Oferta Creada', description: `Nueva oferta para "${selectedProduct?.name}" publicada.` });
    }
    
    setOffers(updatedOffers);
    localStorage.setItem('click-shop-offers', JSON.stringify(updatedOffers));
    form.reset();
    setEditingOffer(null);
  };

  const handleEditClick = (offer: Offer) => {
    setEditingOffer(offer);
    form.reset({
      productId: offer.productId,
      discountPrice: offer.discountPrice,
      description: offer.description,
      dateRange: { from: offer.startDate, to: offer.endDate },
    });
  };
  
  const handleDeleteClick = (offerId: string) => {
      const updatedOffers = offers.filter(o => o.id !== offerId);
      setOffers(updatedOffers);
      localStorage.setItem('click-shop-offers', JSON.stringify(updatedOffers));
      toast({ title: 'Oferta Eliminada', variant: 'destructive'});
  }

  const getOfferStatus = (offer: Offer): { text: 'Activa' | 'Expirada' | 'Próxima', variant: 'default' | 'destructive' | 'secondary' } => {
    const now = new Date();
    if (now < offer.startDate) return { text: 'Próxima', variant: 'secondary' };
    if (now > offer.endDate) return { text: 'Expirada', variant: 'destructive' };
    return { text: 'Activa', variant: 'default' };
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Ofertas</h1>
        <p className="text-muted-foreground">Crea, edita y elimina ofertas especiales para tus clientes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingOffer ? 'Editar Oferta' : 'Crear Nueva Oferta'}</CardTitle>
          <CardDescription>Selecciona un producto y define los detalles de la promoción.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="productId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Producto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un producto" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormItem>
                  <FormLabel>Precio Original</FormLabel>
                  <Input readOnly value={selectedProduct ? `$${selectedProduct.price.toFixed(2)}` : 'N/A'} />
                </FormItem>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="discountPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio con Descuento (USD)</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="Ej: 39.99" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dateRange" render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel>Duración de la Oferta</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value.from && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value.from ? (
                                field.value.to ? (
                                    `${format(field.value.from, 'LLL dd, y')} - ${format(field.value.to, 'LLL dd, y')}`
                                ) : (format(field.value.from, 'LLL dd, y'))
                            ) : ( <span>Elige un rango de fechas</span> )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{ from: field.value.from, to: field.value.to }}
                          onSelect={(range) => field.onChange({ from: range?.from, to: range?.to })}
                          numberOfMonths={2}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción Breve</FormLabel>
                  <FormControl><Textarea placeholder="Ej: ¡Solo por esta semana! Aprovecha un 20% de descuento." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-4">
                <Button type="submit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {editingOffer ? 'Actualizar Oferta' : 'Publicar Oferta'}
                </Button>
                 {editingOffer && (
                    <Button variant="outline" onClick={() => { setEditingOffer(null); form.reset(); }}>
                        Cancelar Edición
                    </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ofertas Publicadas</CardTitle>
          <CardDescription>Lista de todas las ofertas activas, próximas y expiradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Precio Original</TableHead>
                <TableHead>Precio Oferta</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">No hay ofertas publicadas.</TableCell></TableRow>
              ) : (
                offers.map(offer => {
                  const product = products.find(p => p.id === offer.productId);
                  const status = getOfferStatus(offer);
                  return (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{product?.name || 'Producto no encontrado'}</TableCell>
                      <TableCell>${product?.price.toFixed(2)}</TableCell>
                      <TableCell className="font-bold text-primary">${offer.discountPrice.toFixed(2)}</TableCell>
                      <TableCell>{`${format(offer.startDate, 'P', { locale: es })} - ${format(offer.endDate, 'P', { locale: es })}`}</TableCell>
                      <TableCell><Badge variant={status.variant}>{status.text}</Badge></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(offer)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(offer.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
