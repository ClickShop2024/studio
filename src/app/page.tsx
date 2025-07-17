
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { products } from '@/lib/data';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { useAuth } from '@/hooks/use-auth';
import { SmartSuggestions } from '@/components/smart-suggestions';
import { NotificationDialog } from '@/components/notification-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export default function Home() {
  const { user, favorites, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  const categories = ['Todos', 'Ropa femenina', 'Accesorios', 'Calzado', 'Especiales', 'Favoritos'];

  const getProductsByCategory = (category: string): Product[] => {
    switch (category) {
      case 'Todos':
        return products;
      case 'Ropa femenina':
        return products.filter(p => p.category === 'Dama' || p.category === 'Vestidos');
      case 'Accesorios':
        return products.filter(p => p.category === 'Accesorios');
      case 'Calzado':
        // Placeholder, no products in this category yet
        return [];
      case 'Especiales':
        return products.filter(p => p.category === 'Ofertas' || p.price < 40);
      case 'Favoritos':
        return isAuthenticated ? products.filter(p => favorites.includes(p.id)) : [];
      default:
        return [];
    }
  };

  const filteredProducts = getProductsByCategory(activeCategory).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <NotificationDialog />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Productos</h1>
        <p className="text-muted-foreground">Explora nuestras últimas colecciones.</p>
      </div>

      {user?.role === 'Customer' && <SmartSuggestions />}

      <div className="space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              onClick={() => setActiveCategory(cat)}
              disabled={cat === 'Favoritos' && !isAuthenticated}
              className="transition-all"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            {activeCategory === 'Favoritos' && !isAuthenticated ? (
              <p className="text-muted-foreground">
                <Link href="/login" className="underline font-semibold text-primary">Inicia sesión</Link> para ver tus favoritos.
              </p>
            ) : (
              <p className="text-muted-foreground">
                No se encontraron productos que coincidan con tu búsqueda o filtro.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
