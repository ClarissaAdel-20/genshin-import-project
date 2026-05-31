export interface Weapon {
  id: string;
  name: string;
  type: string;
  description: string;
  stock: number;
  image: string;
  price: number;
}

export interface DbUserSession {
  username: string;
  role: 'admin' | 'user';
  token: string;
}

export interface SystemLog {
  timestamp: string;
  type: 'server' | 'mysql';
  message: string;
  query?: string;
}
