
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, DollarSign, Package, Users, ShoppingCart, Eye } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import type { User, Product } from '@/lib/types';

interface Invoice {
  id: string;
  date: string;
  customerName: string;
  total: number;
  status: 'Pagada' | 'Pendiente' | 'Anulada';
}

interface ConversionData {
  rate: string;
  details: string;
}

export default function DashboardPage() {
  const { user, getAllUsers } = useAuth();
  const [totalSales, setTotalSales] = useState(0);
  const [activeClients, setActiveClients] = useState(0);
  const [productsInStock, setProductsInStock] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState(0);
  const [conversionData, setConversionData] = useState<ConversionData>({ rate: "0.00%", details: "Sin datos suficientes." });


  useEffect(() => {
    // This effect will run when the component mounts and also when any dependency changes.
    // For a real-time feel, you might listen to custom events or re-fetch on navigation.
    function calculateMetrics() {
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
        
        // Calculate Conversion Rate
        const visits = parseInt(localStorage.getItem('click-shop-catalog-visits') || '0', 10);
        const purchases = storedInvoices ? JSON.parse(storedInvoices).filter((inv: Invoice) => inv.status === 'Pagada').length : 0;
        
        if (visits > 0) {
            const rate = (purchases / visits) * 100;
            setConversionData({
                rate: `${rate.toFixed(2)}%`,
                details: `${purchases} compra(s) de ${visits} visitas`
            });
        } else {
            setConversionData({
                rate: `0.00%`,
                details: `Se necesita registrar visitas al catálogo.`
            });
        }
    }

    calculateMetrics();
    
    // Listen for storage changes to re-calculate metrics for a more "real-time" feel
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'click-shop-invoices' || e.key === 'click-shop-products' || e.key === 'click-shop-catalog-visits') {
            calculateMetrics();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [getAllUsers]);


  if (!user) {
    return null;
  }

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
            <div className="text-2xl font-bold">{conversionData.rate}</div>
            <p className="text-xs text-muted-foreground">{conversionData.details}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
