import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/admin/products/actions";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="admin-header">
        <div>
          <span className="panel__eyebrow">PRODUCTS</span>
          <h1>Manage products</h1>
        </div>
        <a href="/admin/products/new" className="cta">
          + New product
        </a>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(products as Product[] | null)?.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>{p.stock}</td>
              <td>{p.is_active ? "Yes" : "No"}</td>
              <td className="admin-table__actions">
                <a href={`/admin/products/${p.id}/edit`}>Edit</a>
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="admin-table__delete">
                    Delete
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
