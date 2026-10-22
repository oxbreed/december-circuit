import Link from "next/link";
import { directorySignIn } from "../directory-auth";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in for keeping activities. The directory sign-in is not connected yet.",
  path: "/sign-in",
});

export default function SignInPage() {
  const auth = directorySignIn();

  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16 pt-20 sm:px-6 md:px-8 lg:pt-36">
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Keeping activities</p>
      <h1 className="mt-2 font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        Sign in
      </h1>
      <p className="mt-6 max-w-xl text-base leading-7 text-ink">
        {auth.connected
          ? "A project URL is set, and no session is open on this request."
          : "The directory sign-in is not connected yet."}
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
