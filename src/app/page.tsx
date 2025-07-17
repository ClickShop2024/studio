
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { products as initialProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { useAuth } from '@/hooks/use-auth';
import { SmartSuggestions } from '@/components/smart-suggestions';
import { NotificationDialog } from '@/components/notification-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Heart } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Track catalog visit
    const visits = parseInt(localStorage.getItem('click-shop-catalog-visits') || '0', 10);
    localStorage.setItem('click-shop-catalog-visits', (visits + 1).toString());

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
  
  const availableProducts = products.filter(p => p.stock > 0);

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.price.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <NotificationDialog />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Productos</h1>
        <p className="text-muted-foreground">Explora nuestras últimas colecciones.</p>
      </div>

      {user?.role === 'Customer' && <SmartSuggestions />}

      <div className="flex gap-4 items-center">
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, categoría o precio..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
         <Link href="/categories?filter=Favoritos" passHref>
            <Button variant="outline" size="icon" aria-label="Ver favoritos">
                <Heart />
            </Button>
         </Link>
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
             <p className="text-muted-foreground">
                {searchTerm === '' ? 'Todos los productos están agotados.' : 'No se encontraron productos que coincidan con tu búsqueda.'}
              </p>
          </div>
        )}
      </div>
    </div>
  );
}
