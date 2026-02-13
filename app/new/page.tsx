import { redirect } from "next/navigation";
import { createPost } from "@/app/actions";
import { createClient } from "@/lib/supabase-server";

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: topics } = await supabase.from("topics").select("id,name").order("name");

  return (
    <section className="mx-auto max-w-2xl space-y-4 rounded-xl border bg-white p-5">
      <h1 className="text-xl font-bold">New post</h1>
      <form action={createPost} className="space-y-3">
        <select name="type" required>
          <option value="brief">Brief</option>
          <option value="discussion">Discussion</option>
        </select>
        <select name="topic_id" required>
          <option value="">Select topic</option>
          {topics?.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
        </select>
        <input name="title" placeholder="Clear and concise title" required />
        <textarea name="body" placeholder="Share insights, references, and context. No doxxing or private personal info." rows={8} required />
        <button className="rounded-lg bg-brand px-4 py-2 text-white">Publish</button>
      </form>
    </section>
  );
}
