
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, DollarSign, Package, Users } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import type { User, Product } from '@/lib/types';

interface Invoice {
  id: string;
  date: string;
  customerName: string;
  total: number;
  status: 'Pagada' | 'Pendiente' | 'Anulada';
}

export default function DashboardPage() {
  const { user, getAllUsers } = useAuth();
  const [totalSales, setTotalSales] = useState(0);
  const [activeClients, setActiveClients] = useState(0);
  const [productsInStock, setProductsInStock] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState(0);

  useEffect(() => {
    // Calculate Total Sales
    const storedInvoices = localStorage.getItem('click-shop-invoices');
    if (storedInvoices) {
      const invoices: Invoice[] = JSON.parse(storedInvoices);
      const currentSales = invoices
        .filter(inv => inv.status === 'Pagada')
        .reduce((acc, inv) => acc + inv.total, 0);
      setTotalSales(currentSales);
    }

    // Calculate Active Clients (last 30 days)
    const allUsers = getAllUsers();
    const now = new Date();
    const activeUsers = allUsers.filter(u => {
      if (!u.lastLogin) return false;
      const lastLoginDate = new Date(u.lastLogin);
      return differenceInDays(now, lastLoginDate) <= 30;
    });
    setActiveClients(activeUsers.length);

    // Calculate Products in Stock and Low Stock products
    const storedProducts = localStorage.getItem('click-shop-products');
    if (storedProducts) {
      const products: Product[] = JSON.parse(storedProducts);
      const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
      const lowStock = products.filter(p => p.stock > 0 && p.stock < 5).length;
      setProductsInStock(totalStock);
      setLowStockProducts(lowStock);
    }
  }, [getAllUsers]);


  if (!user) {
    return null;
  }

  // Conversion rate is complex without visitor tracking, so we keep it static for now.
  const dashboardData = {
    conversionRate: {
        rate: "N/A",
        change: "Seguimiento no implementado"
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Panel de {user.role}</h1>
        <p className="text-muted-foreground mt-2">Bienvenido, {user.name}. Aquí tienes un resumen de la tienda.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales (Pagadas)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Suma de todas las facturas no anuladas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{activeClients}</div>
            <p className="text-xs text-muted-foreground">Usuarios con sesión en los últimos 30 días.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos en Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsInStock}</div>
            <p className="text-xs text-muted-foreground">
                {lowStockProducts > 0 
                    ? `${lowStockProducts} producto(s) con stock bajo.`
                    : 'Total de unidades disponibles.'
                }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.conversionRate.rate}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.conversionRate.change}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
