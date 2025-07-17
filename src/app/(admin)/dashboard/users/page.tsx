"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserCheck, UserX, Search } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function UsersPage() {
  const { getAllUsers, updateUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionToConfirm, setActionToConfirm] = useState<'block' | 'unblock' | null>(null);

  useEffect(() => {
    setUsers(getAllUsers());
  }, [getAllUsers]);

  const handleActionClick = (user: User, action: 'block' | 'unblock') => {
    setSelectedUser(user);
    setActionToConfirm(action);
    setIsAlertOpen(true);
  };

  const confirmAction = () => {
    if (!selectedUser || !actionToConfirm) return;

    const newStatus = actionToConfirm === 'block' ? 'blocked' : 'active';
    const updatedUser = { ...selectedUser, status: newStatus };
    
    updateUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));

    toast({
        title: `Usuario ${actionToConfirm === 'block' ? 'bloqueado' : 'desbloqueado'}`,
        description: `El usuario ${selectedUser.name} ha sido ${actionToConfirm === 'block' ? 'bloqueado' : 'desbloqueado'}.`,
    });

    closeAlert();
  };
  
  const closeAlert = () => {
    setIsAlertOpen(false);
    setSelectedUser(null);
    setActionToConfirm(null);
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), "dd/MM/yyyy, h:mm a");
    } catch (e) {
        return 'Fecha inválida';
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
      <p className="text-muted-foreground mt-2">Administra los roles y permisos de los usuarios.</p>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>Visualiza, busca y gestiona el acceso de los usuarios.</CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, email o rol..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Último Inicio de Sesión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div>{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{formatDate(user.lastLogin)}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.status === 'active' ? 'Activo' : 'Bloqueado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                               {user.status === 'active' ? (
                                    <DropdownMenuItem onClick={() => handleActionClick(user, 'block')}>
                                        <UserX className="mr-2 h-4 w-4" />
                                        <span>Bloquear Usuario</span>
                                    </DropdownMenuItem>
                               ) : (
                                    <DropdownMenuItem onClick={() => handleActionClick(user, 'unblock')}>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        <span>Desbloquear Usuario</span>
                                    </DropdownMenuItem>
                               )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        No se encontraron usuarios.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                      {`Estás a punto de ${actionToConfirm === 'block' ? 'bloquear' : 'desbloquear'} a ${selectedUser?.name}. Esta acción ${actionToConfirm === 'block' ? 'impedirá' : 'restaurará'} su acceso a la aplicación.`}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={closeAlert}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmAction}>Confirmar</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
