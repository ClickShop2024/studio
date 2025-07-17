
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products as initialProducts } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, RotateCcw } from 'lucide-react';
import type { Product } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CartItem extends Product {
  quantity: number;
}

interface Invoice {
  id: string;
  date: string; // ISO String format
  customerName: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: 'Pagada' | 'Pendiente' | 'Anulada';
}

export default function BillingPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [invoiceToVoid, setInvoiceToVoid] = useState<Invoice | null>(null);

  useEffect(() => {
    // Load products from localStorage or use initial data
    const storedProducts = localStorage.getItem('click-shop-products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(initialProducts);
      localStorage.setItem('click-shop-products', JSON.stringify(initialProducts));
    }
    
    // Load invoices from localStorage
    const storedInvoices = localStorage.getItem('click-shop-invoices');
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }
  }, []);
  
  const formatDisplayDate = (isoDate: string) => {
      try {
        return new Date(isoDate).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
      } catch {
        return "Fecha inválida";
      }
  }

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
      date: new Date().toISOString(),
      customerName: customerName || 'Cliente General',
      items: [...cart],
      total: cartTotal,
      paymentMethod,
      status: 'Pagada',
    };
    
    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem('click-shop-invoices', JSON.stringify(updatedInvoices));

    const updatedProducts = products.map(p => {
        const cartItem = cart.find(ci => ci.id === p.id);
        if (cartItem) {
            return { ...p, stock: p.stock - cartItem.quantity };
        }
        return p;
    });

    setProducts(updatedProducts);
    localStorage.setItem('click-shop-products', JSON.stringify(updatedProducts));
    
    setCart([]);
    setCustomerName('');
    setPaymentMethod('');

    toast({ title: "Factura generada", description: `Factura ${newInvoice.id} creada exitosamente.` });
  };
  
  const handleVoidInvoiceClick = (invoice: Invoice) => {
    if (invoice.status === 'Anulada') {
        toast({ title: "Factura ya anulada", variant: 'destructive' });
        return;
    }
    setInvoiceToVoid(invoice);
    setIsAlertOpen(true);
  }

  const confirmVoidInvoice = () => {
    if (!invoiceToVoid) return;

    // Restore stock
    const updatedProducts = products.map(p => {
        const itemToRestore = invoiceToVoid.items.find(i => i.id === p.id);
        if (itemToRestore) {
            return { ...p, stock: p.stock + itemToRestore.quantity };
        }
        return p;
    });
    setProducts(updatedProducts);
    localStorage.setItem('click-shop-products', JSON.stringify(updatedProducts));

    // Update invoice status
    const updatedInvoices = invoices.map(inv => 
        inv.id === invoiceToVoid.id ? { ...inv, status: 'Anulada' } : inv
    );
    setInvoices(updatedInvoices);
    localStorage.setItem('click-shop-invoices', JSON.stringify(updatedInvoices));
    
    toast({ title: "Factura anulada", description: `La factura ${invoiceToVoid.id} ha sido anulada y el stock restaurado.` });
    
    closeAlert();
  };
  
  const closeAlert = () => {
      setIsAlertOpen(false);
      setInvoiceToVoid(null);
  }

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
                                   {products.filter(p => p.stock > 0).map(p => (
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
                                                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                                        className="w-20 h-8"
                                                        min="1"
                                                        max={products.find(p => p.id === item.id)?.stock}
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
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {invoices.length === 0 ? (
                           <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground h-24">No hay facturas registradas.</TableCell>
                           </TableRow>
                      ) : (
                          invoices.map(invoice => (
                              <TableRow key={invoice.id}>
                                  <TableCell className="font-medium">{invoice.id}</TableCell>
                                  <TableCell>{formatDisplayDate(invoice.date)}</TableCell>
                                  <TableCell>{invoice.customerName}</TableCell>
                                  <TableCell>{invoice.paymentMethod}</TableCell>
                                  <TableCell className="text-right">${invoice.total.toFixed(2)}</TableCell>
                                  <TableCell>
                                      <Badge variant={invoice.status === 'Pagada' ? 'default' : (invoice.status === 'Anulada' ? 'destructive' : 'secondary')}>{invoice.status}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleVoidInvoiceClick(invoice)} disabled={invoice.status === 'Anulada'}>
                                        <RotateCcw className="h-4 w-4" />
                                        <span className="sr-only">Anular Factura</span>
                                    </Button>
                                  </TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Estás a punto de anular la factura <strong>{invoiceToVoid?.id}</strong>. Esta acción no se puede deshacer y el stock de los productos será restaurado.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={closeAlert}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmVoidInvoice}>Confirmar Anulación</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
