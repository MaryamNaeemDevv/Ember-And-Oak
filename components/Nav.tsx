import { createClient } from "@/lib/supabase/server";
import NavClient from "@/components/NavClient";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <NavClient
      userEmail={user?.email ?? null}
      isAdmin={isAdmin}
      showOrders={!!user}
    />
  );
}