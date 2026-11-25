export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image_uri: string | null;
  updated_at: string | null; 
  is_favorite: number; 
};
export type Sale = { id: number; total: number; created_at: string };
export type BillItem = { name: string; qty: number; price: number };
export type Suggestion = { name: string; price: number; category: string };