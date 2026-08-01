export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <a href="/admin" className="nav__mark">
          EMBER & OAK — ADMIN
        </a>
        <div className="admin-nav__links">
          <a href="/admin">Dashboard</a>
          <a href="/admin/products">Products</a>
          <a href="/admin/categories">Categories</a>
          <a href="/admin/orders">Orders</a>
          <a href="/admin/messages">Messages</a>
          <a href="/">← Back to site</a>
        </div>
      </nav>
      <div className="admin-content">{children}</div>
    </div>
  );
}
