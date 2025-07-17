
"use client";

import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Card, CardContent, CardFooter, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  originalPrice?: number;
}

export function ProductCard({ product, originalPrice }: ProductCardProps) {
  const { isAuthenticated, toggleFavorite, isFavorite } = useAuth();
  const { toast } = useToast();
  const isFav = isFavorite(product.id);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos.",
        variant: "destructive",
      });
      return;
    }
    toggleFavorite(product.id);
     toast({
        title: isFav ? "Eliminado de favoritos" : "Añadido a favoritos",
        description: product.name,
    });
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ease-in-out">
      <div className="p-0 relative">
        <Image
          src={`${product.image}.png`}
          alt={product.name}
          width={600}
          height={800}
          className="object-cover w-full h-auto aspect-[3/4] rounded-t-lg"
          data-ai-hint={product.dataAiHint}
        />
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 rounded-full h-9 w-9 bg-background/70 hover:bg-background z-10"
          onClick={handleFavoriteClick}
          aria-label="Añadir a favoritos"
        >
          <Heart className={cn("h-5 w-5 text-foreground/80", isFav && "fill-destructive text-destructive")} />
        </Button>
      </div>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold leading-tight">{product.name}</CardTitle>
        <CardDescription className="text-sm mt-1 line-clamp-2">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
            {originalPrice && (
                <p className="text-sm font-medium text-muted-foreground line-through">${originalPrice.toFixed(2)}</p>
            )}
        </div>
        <Button variant="default">Añadir al Carrito</Button>
      </CardFooter>
    </Card>
  );
}
