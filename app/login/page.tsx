"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    router.push("/");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/` } });
    if (error) setError(error.message);
  };

  return (
    <section className="mx-auto max-w-md space-y-4 rounded-xl border bg-white p-5">
      <h1 className="text-xl font-bold">Log in</h1>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <form onSubmit={handleEmailLogin} className="space-y-3">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full" />
        <button className="w-full rounded-lg bg-brand py-2 text-white">Login</button>
      </form>
      <button onClick={handleGoogleLogin} className="w-full rounded-lg border py-2">Continue with Google</button>
      <p className="text-sm">No account? <Link href="/signup" className="text-brand underline">Sign up</Link></p>
    </section>
  );
}
