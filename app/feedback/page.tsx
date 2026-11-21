import { SupportMessageForm } from "../components/support-message-form";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Give feedback",
  description: "Share a comment, suggest an improvement, or report an incorrect listing to Dirty December.",
  path: "/feedback",
});

export default function FeedbackPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-5 font-display text-4xl sm:text-5xl">Give feedback</h1>
      <div className="border border-ink/15 bg-chart">
        <SupportMessageForm formId="site-feedback" feedback />
      </div>
    </main>
  );
}
