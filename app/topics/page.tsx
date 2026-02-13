import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { toggleTopicFollow } from "@/app/actions";

export default async function TopicsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const [{ data: topics }, { data: follows }] = await Promise.all([
    supabase.from("topics").select("id,name,slug").order("name"),
    supabase.from("follows_topics").select("topic_id").eq("user_id", auth.user.id),
  ]);

  const followedSet = new Set((follows ?? []).map((f) => f.topic_id));

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Topics</h1>
      <p className="text-sm text-slate-600">Follow topics to personalize your home feed.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {topics?.map((topic) => {
          const isFollowed = followedSet.has(topic.id);
          return (
            <article key={topic.id} className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold">{topic.name}</h2>
              <p className="text-xs text-slate-500">#{topic.slug}</p>
              <form action={toggleTopicFollow} className="mt-3">
                <input type="hidden" name="topic_id" value={topic.id} />
                <input type="hidden" name="should_follow" value={String(!isFollowed)} />
                <button className="rounded-lg border px-3 py-1.5 text-sm">
                  {isFollowed ? "Unfollow" : "Follow"}
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}
