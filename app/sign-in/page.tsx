import Link from "next/link";
import { signOut } from "../auth/actions";
import { EmailSignIn } from "../components/email-sign-in";
import { directorySignIn } from "../directory-auth";
import { pageMetadata } from "../site";
import { getDirectoryUser } from "../supabase/session";

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in for keeping activities. The directory sign-in is not connected yet.",
  path: "/sign-in",
});

export default async function SignInPage() {
  const auth = directorySignIn();
  if (!auth.connected) {
    return (
      <main id="top" className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16 pt-20 sm:px-6 md:px-8 lg:pt-36">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Keeping activities</p>
        <h1 className="mt-2 font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
          Sign in
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-ink">
          The directory sign-in is not connected yet.
        </p>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
          My trip still keeps events and places in this browser. A saved item stays
          on this device until you remove it.
        </p>
        <Link
          href="/#trip"
          className="mt-6 inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
        >
          My trip
        </Link>
      </main>
    );
  }

  const user = await getDirectoryUser();
  const isAdmin = Boolean(user && auth.adminEmail && user.email === auth.adminEmail);

  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16 pt-20 sm:px-6 md:px-8 lg:pt-36">
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Keeping activities</p>
      <h1 className="mt-2 font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        Sign in
      </h1>
      {user ? (
        <>
          <p className="mt-6 max-w-xl text-base leading-7 text-ink">Signed in as {user.email}.</p>
          <form action={signOut} className="mt-6">
            <button
              type="submit"
              className="inline-flex max-w-full bg-ink px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-chart"
            >
              Sign out
            </button>
          </form>
          {isAdmin ? (
            <Link
              href="/admin"
              className="mt-6 inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Admin
            </Link>
          ) : null}
        </>
      ) : (
        <>
          <p className="mt-6 max-w-xl text-base leading-7 text-ink">
            A project URL is set, and no session is open on this request.
          </p>
          <EmailSignIn />
        </>
      )}
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
        My trip still keeps events and places in this browser. A saved item stays
        on this device until you remove it.
      </p>
      <Link
        href="/#trip"
        className="mt-6 inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
      >
        My trip
      </Link>
    </main>
  );
}
