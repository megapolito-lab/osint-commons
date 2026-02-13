import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { updateProfile } from "@/app/actions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();

  return (
    <section className="mx-auto max-w-2xl space-y-4 rounded-xl border bg-white p-5">
      <h1 className="text-xl font-bold">Edit profile</h1>
      <form action={updateProfile} className="space-y-3">
        <input name="username" placeholder="Username" defaultValue={profile?.username ?? ""} required />
        <input name="display_name" placeholder="Display name" defaultValue={profile?.display_name ?? ""} required />
        <textarea name="bio" placeholder="Your OSINT interests" rows={4} defaultValue={profile?.bio ?? ""} />
        <input name="avatar_url" placeholder="Avatar URL" defaultValue={profile?.avatar_url ?? ""} />
        <button className="rounded-lg bg-brand px-4 py-2 text-white">Save profile</button>
      </form>
    </section>
  );
}
