import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem, Product } from "@/lib/types";
import { notFound, redirect } from "next/navigation";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*, product:products(name, image_urls)")
    .eq("order_id", id);

  const orderItems = (items ?? []) as unknown as (OrderItem & {
    product: Pick<Product, "name" | "image_urls"> | null;
  })[];

  const o = order as Order;

  return (
    <>
      <Nav />
      <div className="shop-page">
        <span className="panel__eyebrow">ORDER #{o.id.slice(0, 8)}</span>
        <h1>Thank you for your order.</h1>
        <span className={`order-status order-status--${o.status}`}>
          {o.status}
        </span>

        <div className="cart-list" style={{ marginTop: 24 }}>
          {orderItems.map((item) => (
            <div className="cart-row" key={item.id}>
              <div className="cart-row__image">
                {item.product?.image_urls[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.image_urls[0]}
                    alt={item.product.name}
                  />
                )}
              </div>
              <div className="cart-row__info">
                <span className="cart-row__name">
                  {item.product?.name ?? "Product"}
                </span>
                <span className="cart-row__price">
                  Qty {item.quantity} × ${item.price_at_purchase.toFixed(2)}
                </span>
              </div>
              <span className="cart-row__line-total">
                ${(item.price_at_purchase * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <span>Total</span>
          <span>${o.total.toFixed(2)}</span>
        </div>

        <p style={{ marginTop: 16 }}>
          Shipping to: {o.shipping_address.name}, {o.shipping_address.line1},{" "}
          {o.shipping_address.city} {o.shipping_address.postal_code}
        </p>
      </div>
    </>
  );
}
