import Link from "next/link";
import Wordmark from "@/components/Wordmark";

export default function NotFound() {
  return (
    <main className="page flex min-h-screen flex-col py-8 md:py-12">
      <Wordmark />
      <div className="my-auto max-w-[42rem] py-20">
        <span className="eyebrow eyebrow-pine">404 · Not found</span>
        <h1 className="display-l mt-5">There is nothing at this address.</h1>
        <p className="lede mt-5">
          The page may have moved, or the link may be incomplete.
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          Return to the home page
        </Link>
      </div>
    </main>
  );
}
