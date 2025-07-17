
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products as initialProducts } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { Product } from '@/lib/types';

interface CartItem extends Product {
  quantity: number;
}

interface Invoice {
  id: string;
  date: string;
  customerName: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: 'Pagada' | 'Pendiente' | 'Anulada';
}

export default function BillingPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1);

  const handleAddProductToCart = (productId: string) => {
    const productToAdd = products.find(p => p.id === productId);
    if (!productToAdd || productToAdd.stock === 0) {
      toast({ title: "Sin Stock", description: "Este producto no tiene stock disponible.", variant: "destructive" });
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem) {
        if (existingItem.quantity < productToAdd.stock) {
          return prevCart.map(item =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          toast({ title: "Límite de Stock", description: "No puedes añadir más de la cantidad disponible en stock.", variant: "destructive" });
          return prevCart;
        }
      } else {
        return [...prevCart, { ...productToAdd, quantity: 1 }];
      }
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  const handleQuantityChange = (productId: string, quantity: number) => {
     const productInStock = products.find(p => p.id === productId);
     if (!productInStock) return;

     if (quantity > 0 && quantity <= productInStock.stock) {
         setCart(cart.map(item => item.id === productId ? { ...item, quantity } : item));
     } else if (quantity > productInStock.stock) {
        toast({ title: "Stock insuficiente", description: `Solo hay ${productInStock.stock} unidades disponibles.`, variant: "destructive" });
     }
  }

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const generateInvoice = () => {
    if (cart.length === 0) {
      toast({ title: "Carrito vacío", description: "Añade productos para generar una factura.", variant: "destructive" });
      return;
    }
    if (!paymentMethod) {
      toast({ title: "Falta método de pago", description: "Por favor, selecciona un método de pago.", variant: "destructive" });
      return;
    }

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      date: new Date().toLocaleString('es-ES'),
      customerName: customerName || 'Cliente General',
      items: [...cart],
      total: cartTotal,
      paymentMethod,
      status: 'Pagada',
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Update stock
    const newProducts = [...products];
    cart.forEach(cartItem => {
        const productIndex = newProducts.findIndex(p => p.id === cartItem.id);
        if (productIndex !== -1) {
            newProducts[productIndex].stock -= cartItem.quantity;
        }
    });
    setProducts(newProducts);
    
    // Clear form
    setCart([]);
    setCustomerName('');
    setPaymentMethod('');

    toast({ title: "Factura generada", description: `Factura ${newInvoice.id} creada exitosamente.` });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Sistema de Facturación</h1>
            <p className="text-muted-foreground mt-2">Registra ventas, genera facturas y gestiona el inventario.</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="exchangeRate" className="whitespace-nowrap">Tasa de cambio (USD)</Label>
            <Input 
                id="exchangeRate"
                type="number" 
                value={exchangeRate} 
                onChange={e => setExchangeRate(Number(e.target.value))}
                className="w-24"
            />
          </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card>
                <CardHeader>
                    <CardTitle>Registro de Venta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Productos Disponibles</Label>
                        <div className="border rounded-lg max-h-60 overflow-y-auto">
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Producto</TableHead>
                                       <TableHead>Stock</TableHead>
                                       <TableHead className="text-right">Precio</TableHead>
                                       <TableHead className="text-right">Acción</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {products.map(p => (
                                       <TableRow key={p.id}>
                                           <TableCell>{p.name}</TableCell>
                                           <TableCell>{p.stock}</TableCell>
                                           <TableCell className="text-right">${p.price.toFixed(2)}</TableCell>
                                           <TableCell className="text-right">
                                               <Button size="icon" variant="ghost" onClick={() => handleAddProductToCart(p.id)} disabled={p.stock === 0}>
                                                   <PlusCircle className="h-4 w-4" />
                                               </Button>
                                           </TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Venta Actual</Label>
                        <div className="border rounded-lg">
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Producto</TableHead>
                                       <TableHead>Cantidad</TableHead>
                                       <TableHead className="text-right">Total</TableHead>
                                       <TableHead className="text-right">Acción</TableHead>
                                   </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {cart.length === 0 ? (
                                       <TableRow>
                                           <TableCell colSpan={4} className="text-center text-muted-foreground h-24">Añade productos a la venta</TableCell>
                                       </TableRow>
                                   ) : (
                                       cart.map(item => (
                                           <TableRow key={item.id}>
                                               <TableCell>{item.name}</TableCell>
                                               <TableCell>
                                                    <Input 
                                                        type="number" 
                                                        value={item.quantity}
                                                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                                        className="w-20 h-8"
                                                        min="1"
                                                        max={item.stock}
                                                    />
                                               </TableCell>
                                               <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                               <TableCell className="text-right">
                                                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleRemoveFromCart(item.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                               </TableCell>
                                           </TableRow>
                                       ))
                                   )}
                               </TableBody>
                           </Table>
                        </div>
                    </div>
                </CardContent>
           </Card>
        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Detalles de Factura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="customerName">Nombre del Cliente (Opcional)</Label>
                        <Input id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Ej: Jane Doe"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Método de Pago</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger id="paymentMethod"><SelectValue placeholder="Seleccionar método" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Efectivo">Efectivo</SelectItem>
                                <SelectItem value="Transferencia">Transferencia</SelectItem>
                                <SelectItem value="Pago Móvil">Pago Móvil</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 pt-4">
                        <h4 className="text-lg font-semibold">Total a Pagar</h4>
                        <p className="text-3xl font-bold text-primary">${cartTotal.toFixed(2)}</p>
                        {exchangeRate > 0 && <p className="text-muted-foreground">Bs. {(cartTotal * exchangeRate).toFixed(2)}</p>}
                    </div>
                    <Button onClick={generateInvoice} className="w-full" disabled={cart.length === 0}>Generar Factura</Button>
                </CardContent>
            </Card>
        </div>
      </div>
      <Card>
          <CardHeader>
              <CardTitle>Historial de Facturación</CardTitle>
              <CardDescription>Lista de todas las facturas generadas.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead># Factura</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Estado</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {invoices.length === 0 ? (
                           <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">No hay facturas registradas.</TableCell>
                           </TableRow>
                      ) : (
                          invoices.map(invoice => (
                              <TableRow key={invoice.id}>
                                  <TableCell className="font-medium">{invoice.id}</TableCell>
                                  <TableCell>{invoice.date}</TableCell>
                                  <TableCell>{invoice.customerName}</TableCell>
                                  <TableCell>{invoice.paymentMethod}</TableCell>
                                  <TableCell className="text-right">${invoice.total.toFixed(2)}</TableCell>
                                  <TableCell className="text-right">
                                      <Badge variant={invoice.status === 'Pagada' ? 'default' : 'secondary'}>{invoice.status}</Badge>
                                  </TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
}
