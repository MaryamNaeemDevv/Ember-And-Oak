import { login } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="auth-page">
      <form className="auth-form" action={login}>
        <span className="panel__eyebrow">SIGN IN</span>
        <h2>Welcome back.</h2>

        {error && <p className="auth-form__error">{error}</p>}

        <label>
          Email
          <input type="email" name="email" required autoComplete="email" />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </label>

        <button className="cta" type="submit">
          Sign in
        </button>

        <p className="auth-form__switch">
          No account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
}
