
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { products as initialProducts } from "@/lib/data";
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

const productSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").trim(),
    category: z.enum(['Dama', 'Vestidos', 'Accesorios', 'Ofertas']),
    price: z.coerce.number().positive("El precio debe ser un número positivo."),
    stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo."),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
});

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
        name: "",
        price: 0,
        stock: 0,
        description: "",
    },
  });

  useEffect(() => {
    const storedProducts = localStorage.getItem('click-shop-products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(initialProducts);
    }

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'click-shop-products' && event.newValue) {
            setProducts(JSON.parse(event.newValue));
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    const existingProductIndex = products.findIndex(p => p.name.toLowerCase() === values.name.toLowerCase());
    
    if (existingProductIndex !== -1) {
        // Product exists, update its stock
        const updatedProducts = [...products];
        const productToUpdate = updatedProducts[existingProductIndex];
        
        productToUpdate.stock += values.stock;
        // Also update other details in case they changed
        productToUpdate.price = values.price;
        productToUpdate.category = values.category as Product['category'];
        productToUpdate.description = values.description;
        
        setProducts(updatedProducts);
        localStorage.setItem('click-shop-products', JSON.stringify(updatedProducts));

        toast({
            title: "Producto existente",
            description: `Se ha actualizado el stock de "${productToUpdate.name}".`,
        });

    } else {
        // Product is new, add it
        const newProduct: Product = {
            id: crypto.randomUUID(),
            ...values,
            image: 'https://placehold.co/600x800', // Default placeholder
            dataAiHint: values.name.split(' ').slice(0,2).join(' ').toLowerCase(),
            category: values.category as Product['category'],
        };

        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        localStorage.setItem('click-shop-products', JSON.stringify(updatedProducts));

        toast({
            title: "Producto Registrado",
            description: `El producto "${newProduct.name}" ha sido añadido al inventario.`,
        });
    }
    
    form.reset();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
        <p className="text-muted-foreground">Visualiza, actualiza y añade nuevos productos al stock.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Registrar o Actualizar Producto</CardTitle>
            <CardDescription>Completa el formulario. Si el producto ya existe por nombre, se actualizará su stock.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nombre del Producto</FormLabel><FormControl><Input placeholder="Ej: Vestido de Verano" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Categoría</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Dama">Dama</SelectItem>
                                    <SelectItem value="Vestidos">Vestidos</SelectItem>
                                    <SelectItem value="Accesorios">Accesorios</SelectItem>
                                    <SelectItem value="Ofertas">Ofertas</SelectItem>
                                </SelectContent>
                            </Select>
                        <FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem><FormLabel>Precio (USD)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Ej: 49.99" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="stock" render={({ field }) => (
                        <FormItem><FormLabel>Cantidad a Añadir</FormLabel><FormControl><Input type="number" placeholder="Ej: 25" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem className="md:col-span-2 lg:col-span-3"><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Describe el producto..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <div className="md:col-span-2 lg:col-span-3">
                        <Button type="submit" className="w-full md:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Registrar / Actualizar Stock
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Inventario Actual</CardTitle>
              <CardDescription>Lista de todos los productos disponibles en la tienda.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {products.length > 0 ? products.map((product) => (
                    <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No hay productos en el inventario.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </CardContent>
      </Card>
    </div>
  );
}
