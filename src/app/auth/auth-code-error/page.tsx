import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-beige">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-red-600">Authentication Error</h1>
        <p className="mt-3 text-2xl text-black/70">
          There was an error verifying your login information.
        </p>
        <p className="mt-4 text-lg text-black/60">
          The link may have expired or has already been used.
        </p>
        <div className="mt-8">
          <Link
            href="/signin"
            className="px-8 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
