
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { products as initialProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


export default function CategoriesPage() {
  const { favorites, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const initialCategory = searchParams.get('filter') || 'Todos';
  const [activeCategory, setActiveCategory] = useState(initialCategory);

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
  
  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory])

  const categories = ['Todos', 'Ropa femenina', 'Accesorios', 'Calzado', 'Especiales', 'Favoritos'];

  const getProductsByCategory = (category: string): Product[] => {
    const availableProducts = products.filter(p => p.stock > 0);
    switch (category) {
      case 'Todos':
        return availableProducts;
      case 'Ropa femenina':
        return availableProducts.filter(p => p.category === 'Dama' || p.category === 'Vestidos');
      case 'Accesorios':
        return availableProducts.filter(p => p.category === 'Accesorios');
      case 'Calzado':
        // Placeholder, no products in this category yet
        return [];
      case 'Especiales':
        return availableProducts.filter(p => p.category === 'Ofertas');
      case 'Favoritos':
        return isAuthenticated ? availableProducts.filter(p => favorites.includes(p.id)) : [];
      default:
        return [];
    }
  };

  const filteredProducts = getProductsByCategory(activeCategory);

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold">Categorías</h1>
        <p className="text-muted-foreground mt-2">Explora nuestros productos por categoría.</p>
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
                    No hay productos disponibles en esta categoría.
                 </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
