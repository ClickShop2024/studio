
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, DollarSign, Package, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  // In a real app, you would fetch this data from your backend
  // For now, we'll use placeholder data and logic can be added later.
  const dashboardData = {
    totalSales: {
        amount: "45,231.89",
        change: "+20.1% desde el mes pasado"
    },
    activeClients: {
        count: "+2350",
        change: "+180.1% desde el mes pasado"
    },
    productsInStock: {
        count: "152",
        description: "Total de productos disponibles"
    },
    conversionRate: {
        rate: "+12.5%",
        change: "Desde la semana pasada"
    }
  };

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
            <div className="text-2xl font-bold">${dashboardData.totalSales.amount}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.totalSales.change}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeClients.count}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.activeClients.change}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos en Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.productsInStock.count}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.productsInStock.description}</p>
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
