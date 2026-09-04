"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="container section">
          <p className="eyebrow">Something went wrong</p>
          <h1 className="section-heading">Please try again.</h1>
          <button
            className="button button-primary"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
