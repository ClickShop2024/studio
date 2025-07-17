export type Role = 'Customer' | 'Employee' | 'Administrator';

export type Gender = 'male' | 'female' | 'other';

export type UserStatus = 'active' | 'blocked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  size?: string;
  gender?: Gender;
  status: UserStatus;
  lastLogin?: string;
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

export interface Offer {
    id: string;
    productId: string;
    discountPrice: number;
    startDate: Date;
    endDate: Date;
    description: string;
}
