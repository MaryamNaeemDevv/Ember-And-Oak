import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: productCount }, { count: orderCount }, { data: lowStock }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("products").select("name, stock").lt("stock", 5),
    ]);

  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div>
      <span className="panel__eyebrow">DASHBOARD</span>
      <h1>Overview</h1>

      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat__value">{productCount ?? 0}</span>
          <span className="admin-stat__label">Products</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__value">{orderCount ?? 0}</span>
          <span className="admin-stat__label">Total orders</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__value">
            {(pendingOrders as unknown as { length: number })?.length ?? 0}
          </span>
          <span className="admin-stat__label">Pending orders</span>
        </div>
      </div>

      {lowStock && lowStock.length > 0 && (
        <div className="admin-alert">
          <span className="panel__eyebrow">LOW STOCK</span>
          <ul>
            {lowStock.map((p) => (
              <li key={p.name}>
                {p.name} — {p.stock} left
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
