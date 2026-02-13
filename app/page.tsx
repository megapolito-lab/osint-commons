import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { PostCard } from "@/components/post-card";
import { votePost } from "@/app/actions";

export default async function HomePage({ searchParams }: { searchParams: { followed?: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  let followedTopicIds: number[] = [];
  if (auth.user) {
    const { data } = await supabase.from("follows_topics").select("topic_id").eq("user_id", auth.user.id);
    followedTopicIds = data?.map((row) => row.topic_id) ?? [];
  }

  let query = supabase
    .from("posts")
    .select("id,title,body,created_at,type,topic:topics(name,slug),author:profiles(username,display_name),votes(value)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(30);

  if (searchParams.followed === "1" && followedTopicIds.length > 0) {
    query = query.in("topic_id", followedTopicIds);
  }

  const { data: posts } = await query;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Latest intel feed</h1>
        {auth.user && (
          <Link href={searchParams.followed === "1" ? "/" : "/?followed=1"} className="text-sm text-brand underline">
            {searchParams.followed === "1" ? "Show all" : "Following only"}
          </Link>
        )}
      </div>

      {!posts?.length && <p className="text-sm text-slate-600">No posts yet. Start the first discussion.</p>}

      <div className="space-y-3">
        {posts?.map((post) => {
          const score = post.votes?.reduce((acc, vote) => acc + vote.value, 0) ?? 0;

          return (
            <div key={post.id} className="space-y-2">
              <PostCard {...post} score={score} />
              {auth.user && (
                <div className="flex gap-2 px-1">
                  <form action={votePost}>
                    <input type="hidden" name="post_id" value={post.id} />
                    <input type="hidden" name="value" value="1" />
                    <button className="rounded border bg-white px-2 py-1 text-xs">▲ Upvote</button>
                  </form>
                  <form action={votePost}>
                    <input type="hidden" name="post_id" value={post.id} />
                    <input type="hidden" name="value" value="-1" />
                    <button className="rounded border bg-white px-2 py-1 text-xs">▼ Downvote</button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
