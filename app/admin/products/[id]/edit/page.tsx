import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "@/app/admin/products/actions";
import type { Category, Product } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!product) notFound();
  const p = product as Product;

  return (
    <div>
      <span className="panel__eyebrow">PRODUCTS</span>
      <h1>Edit product</h1>

      {error && <p className="auth-form__error">{error}</p>}

      <form action={updateProduct} className="admin-form">
        <input type="hidden" name="id" value={p.id} />
        <label>
          Name
          <input type="text" name="name" defaultValue={p.name} required />
        </label>
        <label>
          Description
          <textarea name="description" rows={4} defaultValue={p.description ?? ""} />
        </label>
        <label>
          Price (USD)
          <input
            type="number"
            name="price"
            step="0.01"
            min={0}
            defaultValue={p.price}
            required
          />
        </label>
        <label>
          Sale price (USD, optional — leave blank if not on sale)
          <input
            type="number"
            name="salePrice"
            step="0.01"
            min={0}
            defaultValue={p.sale_price ?? ""}
          />
        </label>
        <label>
          Stock
          <input
            type="number"
            name="stock"
            min={0}
            defaultValue={p.stock}
            required
          />
        </label>
        <label>
          Category
          <select name="categoryId" defaultValue={p.category_id ?? ""}>
            <option value="">— none —</option>
            {(categories as Category[] | null)?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Image URLs (comma-separated)
          <input
            type="text"
            name="imageUrls"
            defaultValue={p.image_urls.join(", ")}
          />
        </label>
        <label className="admin-form__checkbox">
          <input type="checkbox" name="isActive" defaultChecked={p.is_active} />
          Active (visible in shop)
        </label>

        <button type="submit" className="cta">
          Save changes
        </button>
      </form>
    </div>
  );
}
