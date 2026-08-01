"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = (formData.get("name") as string)?.trim();
  const imageUrl = (formData.get("imageUrl") as string) || null;

  if (!name || name.length < 2) {
    redirect(
      `/admin/categories?error=${encodeURIComponent(
        "Category name must be at least 2 characters."
      )}`
    );
  }

  const { error } = await supabase
    .from("categories")
    .insert({ name, slug: slugify(name), image_url: imageUrl });

  if (error) {
    const message = error.message.includes("duplicate")
      ? "A category with that name already exists."
      : error.message;
    redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("categories").delete().eq("id", id);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}
