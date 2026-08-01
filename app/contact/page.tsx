import Nav from "@/components/Nav";
import { submitContactMessage } from "@/app/contact/actions";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <>
      <Nav />
      <div className="auth-page">
        <form className="auth-form" action={submitContactMessage}>
          <span className="panel__eyebrow">CONTACT</span>
          <h2>Get in touch.</h2>

          {error && <p className="auth-form__error">{error}</p>}
          {success && (
            <p className="auth-form__success">
              Thanks — we'll get back to you soon.
            </p>
          )}

          <label>
            Name
            <input type="text" name="name" required minLength={2} />
          </label>
          <label>
            Email
            <input type="email" name="email" required />
          </label>
          <label>
            Message
            <textarea name="message" rows={5} required minLength={10} />
          </label>

          <button className="cta" type="submit">
            Send message
          </button>
        </form>
      </div>
    </>
  );
}
