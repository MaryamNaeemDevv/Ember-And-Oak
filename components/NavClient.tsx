"use client";

import { useEffect, useState } from "react";
import { logout } from "@/app/auth/actions";

export default function NavClient({
  userEmail,
  isAdmin,
  showOrders,
}: {
  userEmail: string | null;
  isAdmin: boolean;
  showOrders: boolean;
}) {
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    // Fade out once the user has scrolled past a small threshold (not
    // immediately at 1px, so tiny accidental scroll bounces don't trigger
    // it), and fade back in once they scroll back near the top.
    const THRESHOLD = 60;

    const onScroll = () => {
      setFaded(window.scrollY > THRESHOLD);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="nav" data-faded={faded}>
      <a href="/" className="nav__mark-group">
        <span className="nav__mark">EMBER & OAK</span>
        <span className="nav__tagline">MODERN CRAFTSMANSHIP, TIMELESS DESIGN</span>
      </a>

      <div className="nav__links">
        <a href="/shop">Shop</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        {showOrders && <a href="/orders">Orders</a>}
        {isAdmin && <a href="/admin">Admin</a>}
      </div>

      <div className="nav__account">
        <a className="nav__cart" href="/cart">
          Cart
        </a>
        {userEmail ? (
          <form action={logout} className="nav__account-pill">
            <span className="nav__account-dot" title={userEmail} />
            <button className="nav__account-logout" type="submit">
              Log out
            </button>
          </form>
        ) : (
          <div className="nav__account-pill">
            <a href="/login">Log in</a>
            <span className="nav__account-divider" />
            <a href="/register">Register</a>
          </div>
        )}
      </div>
    </nav>
  );
}