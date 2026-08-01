import { createClient } from "@/lib/supabase/server";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import type { Order } from "@/lib/types";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <span className="panel__eyebrow">ORDERS</span>
      <h1>Manage orders</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(orders as Order[] | null)?.map((o) => (
            <tr key={o.id}>
              <td>#{o.id.slice(0, 8)}</td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
              <td>${o.total.toFixed(2)}</td>
              <td>
                <span className={`order-status order-status--${o.status}`}>
                  {o.status}
                </span>
              </td>
              <td>
                <form action={updateOrderStatus} className="admin-inline-form">
                  <input type="hidden" name="id" value={o.id} />
                  <select name="status" defaultValue={o.status}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="nav__cart">
                    Update
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
