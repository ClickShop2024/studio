
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import type { Offer, Product } from '@/lib/types';
import { products as initialProducts } from '@/lib/data';
import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface OfferWithProduct extends Offer {
  product: Product;
}

export default function OffersPage() {
  const [activeOffers, setActiveOffers] = useState<OfferWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedProducts = localStorage.getItem('click-shop-products');
    const products: Product[] = storedProducts ? JSON.parse(storedProducts) : initialProducts;
    
    const storedOffers = localStorage.getItem('click-shop-offers');
    if (storedOffers) {
      const allOffers: Offer[] = JSON.parse(storedOffers).map((o: any) => ({
        ...o,
        startDate: new Date(o.startDate),
        endDate: new Date(o.endDate)
      }));

      const now = new Date();
      const currentOffers = allOffers
        .filter(offer => now >= offer.startDate && now <= offer.endDate)
        .map(offer => {
            const product = products.find(p => p.id === offer.productId && p.stock > 0);
            return product ? { ...offer, product } : null;
        })
        .filter((offer): offer is OfferWithProduct => offer !== null);
      
      setActiveOffers(currentOffers);
    }
    setLoading(false);
  }, []);

  const getOfferTimeLeft = (endDate: Date) => {
    const daysLeft = differenceInDays(endDate, new Date());
    if (daysLeft < 1) {
        return `Termina ${formatDistanceToNow(endDate, { locale: es, addSuffix: true })}`;
    }
    return `Termina en ${daysLeft} día(s)`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Ofertas Especiales</h1>
        <p className="text-muted-foreground mt-2">¡No te pierdas nuestros descuentos exclusivos por tiempo limitado!</p>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Cargando ofertas...</p>
      ) : activeOffers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activeOffers.map(({ product, discountPrice, endDate }) => {
            // Create a temporary product object with the offer price for the card
            const productWithOfferPrice = { ...product, price: discountPrice };
            
            return (
              <div key={product.id} className="relative">
                <ProductCard product={productWithOfferPrice} originalPrice={product.price} />
                <Badge variant="destructive" className="absolute top-2 left-2 z-10">
                  {getOfferTimeLeft(endDate)}
                </Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 text-center text-muted-foreground py-16">
          <p className="text-lg">No hay ofertas disponibles en este momento.</p>
          <p>Vuelve pronto para ver nuevas promociones.</p>
        </div>
      )}
    </div>
  );
}
