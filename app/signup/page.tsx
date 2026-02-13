"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setError(error.message);
    setMessage("Signup successful. Check your email for confirmation.");
    router.push("/");
  };

  return (
    <section className="mx-auto max-w-md space-y-4 rounded-xl border bg-white p-5">
      <h1 className="text-xl font-bold">Create account</h1>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded bg-green-50 p-2 text-sm text-green-700">{message}</p>}
      <form onSubmit={handleSignup} className="space-y-3">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full" />
        <input type="password" placeholder="Password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full" />
        <button className="w-full rounded-lg bg-brand py-2 text-white">Sign up</button>
      </form>
      <p className="text-sm">Have an account? <Link href="/login" className="text-brand underline">Login</Link></p>
    </section>
  );
}
