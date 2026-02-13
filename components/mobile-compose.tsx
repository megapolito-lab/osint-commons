import Link from "next/link";

export function MobileComposeButton() {
  return (
    <Link
      href="/new"
      className="fixed bottom-5 right-5 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lg sm:hidden"
    >
      + Compose
    </Link>
  );
}
