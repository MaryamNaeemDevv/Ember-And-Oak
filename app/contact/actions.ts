"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactMessage(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  const errors: string[] = [];
  if (!name || name.length < 2) errors.push("Please enter your name.");
  if (!email || !EMAIL_RE.test(email)) {
    errors.push("Please enter a valid email address.");
  }
  if (!message || message.length < 10) {
    errors.push("Message must be at least 10 characters.");
  }

  if (errors.length > 0) {
    redirect(`/contact?error=${encodeURIComponent(errors.join(" "))}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, message });

  if (error) {
    redirect(
      `/contact?error=${encodeURIComponent(
        "Something went wrong sending your message. Please try again."
      )}`
    );
  }

  redirect("/contact?success=1");
}
