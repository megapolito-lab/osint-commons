import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { signOut } from "@/app/actions";

export async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand">Orien</Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/topics">Topics</Link>
          <Link href="/rules">Rules</Link>
          {data.user ? (
            <>
              <Link href="/new" className="hidden rounded-lg bg-brand px-3 py-1.5 text-white sm:inline-block">Compose</Link>
              <Link href="/profile">Profile</Link>
              <form action={signOut}>
                <button type="submit" className="text-slate-600">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
