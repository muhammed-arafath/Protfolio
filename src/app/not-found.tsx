import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">error 404 · device offline</div>
      <h1 className="mt-4 font-display text-5xl font-semibold">Signal lost.</h1>
      <p className="mt-3 text-muted">This page isn&apos;t publishing on any topic.</p>
      <Link href="/" className="btn btn-primary mt-8">Back to home</Link>
    </main>
  );
}
