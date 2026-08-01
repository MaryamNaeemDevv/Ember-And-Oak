import { register } from "@/app/auth/actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="auth-page">
      <form className="auth-form" action={register}>
        <span className="panel__eyebrow">CREATE ACCOUNT</span>
        <h2>Join Ember & Oak.</h2>

        {error && <p className="auth-form__error">{error}</p>}

        <label>
          Full name
          <input type="text" name="fullName" required autoComplete="name" />
        </label>

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
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        <button className="cta" type="submit">
          Create account
        </button>

        <p className="auth-form__switch">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </form>
    </div>
  );
}
