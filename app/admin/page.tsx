import type { Metadata } from "next";
import Link from "next/link";
import { directorySignIn } from "../directory-auth";
import { pageMetadata } from "../site";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Admin",
    description: "Control of the records on file stays closed until an admin is signed in.",
    path: "/admin",
  }),
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const auth = directorySignIn();

  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16 pt-20 sm:px-6 md:px-8 lg:pt-36">
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Records</p>
      <h1 className="mt-2 font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        Admin
      </h1>
      <p className="mt-6 text-base leading-7 text-ink">Access refused.</p>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
        {auth.connected
          ? "Nobody is signed in. This page opens only for the admin address held on the server."
          : "Nobody is signed in. The directory sign-in is not connected yet, so the records stay closed."}
      </p>
      <Link
        href="/sign-in"
        className="mt-6 inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
      >
        Sign in
      </Link>
    </main>
  );
}
