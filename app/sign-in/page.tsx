import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { signOut } from "../auth/actions";
import { EmailSignIn } from "../components/email-sign-in";
import { directorySignIn, isAdminEmail } from "../directory-auth";
import { pageMetadata } from "../site";
import { getDirectoryUser } from "../supabase/session";

function signinMessage(reason: string | undefined) {
  if (reason === "link-failed") {
    return "That sign-in link could not be completed. Request a new link and open it in the same browser you used on this page.";
  }
  if (reason === "link-incomplete") {
    return "That sign-in link was missing the code this site needs. Request a new link and open it in the same browser.";
  }
  if (reason === "not-connected") {
    return "The directory sign-in is not connected yet.";
  }
  return null;
}

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to dirtydecember.info with an email link. My trip still keeps events and places in this browser.",
  path: "/sign-in",
});

function SignInFrame({ children }: { children: ReactNode }) {
  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16 pt-20 sm:px-6 md:px-8 lg:pt-36">
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Keeping activities</p>
      <h1 className="mt-2 font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        Sign in
      </h1>
      {children}
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

function UnsignedIn({ notice }: { notice?: string | null }) {
  return (
    <>
      {notice ? (
        <p className="mt-6 max-w-xl text-base leading-7 text-oxide">{notice}</p>
      ) : null}
      <p className="mt-6 max-w-xl text-base leading-7 text-ink">
        Enter your email and we will send a sign-in link. Use that link to open
        a session on this site, including the admin console if your address is
        allowlisted.
      </p>
      <EmailSignIn />
    </>
  );
}

async function SignInSession({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getDirectoryUser();
  const isAdmin = isAdminEmail(user?.email);
  const params = await searchParams;
  const raw = params.signin;
  const reason = Array.isArray(raw) ? raw[0] : raw;
  const notice = signinMessage(reason);

  return (
    <SignInFrame>
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
        <UnsignedIn notice={notice} />
      )}
    </SignInFrame>
  );
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (!directorySignIn().connected) {
    return (
      <SignInFrame>
        <p className="mt-6 max-w-xl text-base leading-7 text-ink">
          The directory sign-in is not connected yet.
        </p>
      </SignInFrame>
    );
  }

  return (
    <Suspense
      fallback={
        <SignInFrame>
          <UnsignedIn />
        </SignInFrame>
      }
    >
      <SignInSession searchParams={searchParams} />
    </Suspense>
  );
}
