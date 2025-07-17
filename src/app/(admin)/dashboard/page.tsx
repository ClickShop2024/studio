
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, DollarSign, Package, Users } from 'lucide-react';
import { differenceInDays, isToday, isThisWeek, isThisMonth } from 'date-fns';
import type { User, Product } from '@/lib/types';

interface Invoice {
  id: string;
  date: string; // ISO String
  customerName: string;
  total: number;
  status: 'Pagada' | 'Pendiente' | 'Anulada';
}

interface ConversionData {
  rate: string;
  details: string;
}

type SalesPeriod = 'day' | 'week' | 'month';

export default function DashboardPage() {
  const { user, getAllUsers } = useAuth();
  const [totalSales, setTotalSales] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>('day');
  const [activeClients, setActiveClients] = useState(0);
  const [productsInStock, setProductsInStock] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState(0);
  const [conversionData, setConversionData] = useState<ConversionData>({ rate: "0.00%", details: "Sin datos suficientes." });


  useEffect(() => {
    function calculateMetrics() {
        const storedInvoices = localStorage.getItem('click-shop-invoices');
        const invoices: Invoice[] = storedInvoices ? JSON.parse(storedInvoices) : [];
        const validInvoices = invoices.filter(inv => inv.status === 'Pagada');

        const salesFilters: Record<SalesPeriod, (date: Date) => boolean> = {
            day: (date) => isToday(date),
            week: (date) => isThisWeek(date, { weekStartsOn: 1 }),
            month: (date) => isThisMonth(date),
        };
        
        const periodFilter = salesFilters[salesPeriod];
        const periodInvoices = validInvoices.filter(inv => periodFilter(new Date(inv.date)));

        const currentSales = periodInvoices.reduce((acc, inv) => acc + inv.total, 0);
        setTotalSales(currentSales);
        setSalesCount(periodInvoices.length);

        const allUsers = getAllUsers();
        const now = new Date();
        const activeUsers = allUsers.filter(u => {
          if (!u.lastLogin) return false;
          const lastLoginDate = new Date(u.lastLogin);
          return differenceInDays(now, lastLoginDate) <= 30;
        });
        setActiveClients(activeUsers.length);

        const storedProducts = localStorage.getItem('click-shop-products');
        if (storedProducts) {
          const products: Product[] = JSON.parse(storedProducts);
          const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
          const lowStock = products.filter(p => p.stock > 0 && p.stock < 5).length;
          setProductsInStock(totalStock);
          setLowStockProducts(lowStock);
        }
        
        const visits = parseInt(localStorage.getItem('click-shop-catalog-visits') || '0', 10);
        const purchases = validInvoices.length;
        
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
    
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'click-shop-invoices' || e.key === 'click-shop-products' || e.key === 'click-shop-catalog-visits') {
            calculateMetrics();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [getAllUsers, salesPeriod]);

  const getSalesPeriodText = () => {
      switch(salesPeriod) {
          case 'day': return `Ventas realizadas hoy`;
          case 'week': return `Ventas de esta semana`;
          case 'month': return `Ventas de este mes`;
      }
  }


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
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{salesCount} {getSalesPeriodText()}</p>
             <div className="flex gap-2 mt-2">
                <Button size="sm" variant={salesPeriod === 'day' ? 'default' : 'outline'} onClick={() => setSalesPeriod('day')}>Hoy</Button>
                <Button size="sm" variant={salesPeriod === 'week' ? 'default' : 'outline'} onClick={() => setSalesPeriod('week')}>Semana</Button>
                <Button size="sm" variant={salesPeriod === 'month' ? 'default' : 'outline'} onClick={() => setSalesPeriod('month')}>Mes</Button>
             </div>
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
