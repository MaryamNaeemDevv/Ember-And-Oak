import { createClient } from "@/lib/supabase/server";
import { createCategory, deleteCategory } from "@/app/admin/categories/actions";
import type { Category } from "@/lib/types";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div>
      <span className="panel__eyebrow">CATEGORIES</span>
      <h1>Manage categories</h1>

      {error && <p className="auth-form__error">{error}</p>}

      <form action={createCategory} className="admin-inline-form">
        <input type="text" name="name" placeholder="e.g. Sofas" required />
        <input
          type="text"
          name="imageUrl"
          placeholder="Tile image URL"
          style={{ flex: 1 }}
        />
        <button type="submit" className="cta">
          Add category
        </button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(categories as Category[] | null)?.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.slug}</td>
              <td className="admin-table__actions">
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
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
