export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  category_id: string | null;
  image_urls: string[];
  is_active: boolean;
  created_at: string;
};

export type CartItemWithProduct = {
  id: string;
  quantity: number;
  product: Product;
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total: number;
  shipping_address: {
    name: string;
    line1: string;
    city: string;
    postal_code: string;
    phone: string;
  };
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price_at_purchase: number;
};
