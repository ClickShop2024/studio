"use client";

import { useTheme } from '@/components/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">Configuración</h1>
            
            {user && (
                <Card>
                    <CardHeader>
                        <CardTitle>Perfil</CardTitle>
                        <CardDescription>Gestiona la información de tu perfil.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input id="name" defaultValue={user.name} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user.email} readOnly />
                        </div>
                        <Button>Guardar Cambios</Button>
                    </CardContent>
                </Card>
            )}
            
            <Card>
                <CardHeader>
                    <CardTitle>Preferencias</CardTitle>
                    <CardDescription>Gestiona la configuración de la aplicación.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="language" className="font-medium">Idioma</Label>
                        <Select defaultValue="es">
                            <SelectTrigger id="language" className="w-[180px]">
                                <SelectValue placeholder="Idioma" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="theme-switch" className="font-medium">Tema</Label>
                        <div className="flex items-center gap-2">
                           <span>Claro</span>
                           <Switch
                             id="theme-switch"
                             checked={theme === 'dark'}
                             onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                           />
                           <span>Oscuro</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sobre Nosotros</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Click Shop es tu tienda de moda online de confianza. Ofrecemos las últimas tendencias en ropa y accesorios con la mejor calidad y precios.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
