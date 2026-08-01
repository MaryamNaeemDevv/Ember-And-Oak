import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Nav />
      <div className="shop-page">
        <h1>Your Orders</h1>

        {orders?.length === 0 && (
          <p className="shop-empty">
            No orders yet. <a href="/shop">Start shopping →</a>
          </p>
        )}

        <div className="order-list">
          {(orders as Order[] | null)?.map((order) => (
            <a
              key={order.id}
              href={`/orders/${order.id}`}
              className="order-row"
            >
              <span className="order-row__id">
                #{order.id.slice(0, 8)}
              </span>
              <span className="order-row__date">
                {new Date(order.created_at).toLocaleDateString()}
              </span>
              <span className={`order-status order-status--${order.status}`}>
                {order.status}
              </span>
              <span className="order-row__total">
                ${order.total.toFixed(2)}
              </span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
