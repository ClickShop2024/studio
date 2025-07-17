
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { products } from '@/lib/data';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { SmartSuggestions } from '@/components/smart-suggestions';
import { NotificationDialog } from '@/components/notification-dialog';

export default function Home() {
  const { user, favorites, isAuthenticated } = useAuth();

  const categories = ['Ropa femenina', 'Accesorios', 'Calzado', 'Especiales', 'Favoritos'];
  
  const getProductsForTab = (tab: string): Product[] => {
    if (tab === 'Favoritos') {
      return isAuthenticated ? products.filter(p => favorites.includes(p.id)) : [];
    }
    if (tab === 'Especiales') {
        return products.filter(p => p.category === 'Ofertas' || p.price < 40);
    }
    if (tab === 'Ropa femenina') {
      return products.filter(p => p.category === 'Dama' || p.category === 'Vestidos');
    }
    if (tab === 'Accesorios') {
      return products.filter(p => p.category === 'Accesorios');
    }
    // Placeholder for Calzado
    if (tab === 'Calzado') {
      return [];
    }
    return products.filter(p => p.category === tab);
  };
  
  return (
    <div className="space-y-8">
      <NotificationDialog />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Productos</h1>
        <p className="text-muted-foreground">Explora nuestras últimas colecciones.</p>
      </div>

      {user?.role === 'Customer' && <SmartSuggestions />}

      <Tabs defaultValue="Ropa femenina" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} disabled={cat === 'Favoritos' && !isAuthenticated}>{cat}</TabsTrigger>
          ))}
        </TabsList>
        {categories.map((cat) => (
          <TabsContent key={cat} value={cat}>
            {getProductsForTab(cat).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {getProductsForTab(cat).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                 {cat === 'Favoritos' && !isAuthenticated ? (
                    <p className="text-muted-foreground">
                        <Link href="/login" className="underline font-semibold text-primary">Inicia sesión</Link> para ver tus favoritos.
                    </p>
                 ) : (
                    <p className="text-muted-foreground">
                    {cat === 'Favoritos' ? 'No has guardado ningún favorito todavía.' : `No hay productos en la categoría ${cat}.`}
                    </p>
                 )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
