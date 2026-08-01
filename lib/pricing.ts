import type { Product } from "@/lib/types";

export function effectivePrice(product: Pick<Product, "price" | "sale_price">) {
  return product.sale_price != null && product.sale_price < product.price
    ? product.sale_price
    : product.price;
}
