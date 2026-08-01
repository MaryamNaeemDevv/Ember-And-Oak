"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  await supabase.from("orders").update({ status }).eq("id", id);

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}
