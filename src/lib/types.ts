export type Role = 'Customer' | 'Employee' | 'Administrator';

export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  size?: string;
  gender?: Gender;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'Dama' | 'Vestidos' | 'Accesorios' | 'Ofertas';
  description: string;
  stock: number;
  dataAiHint?: string;
}
