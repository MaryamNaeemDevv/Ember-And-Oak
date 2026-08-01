import { createClient } from "@/lib/supabase/server";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <span className="panel__eyebrow">MESSAGES</span>
      <h1>Contact submissions</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {messages?.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td style={{ maxWidth: 320 }}>{m.message}</td>
              <td>{new Date(m.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {messages?.length === 0 && (
            <tr>
              <td colSpan={4}>No messages yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
