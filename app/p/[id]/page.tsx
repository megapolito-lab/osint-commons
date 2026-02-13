import { notFound, redirect } from "next/navigation";
import { addComment, createReport, votePost } from "@/app/actions";
import { createClient } from "@/lib/supabase-server";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const postId = Number(params.id);
  if (Number.isNaN(postId)) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const [{ data: post }, { data: comments }] = await Promise.all([
    supabase
      .from("posts")
      .select("*,topic:topics(name,slug),author:profiles(username,display_name),votes(value)")
      .eq("id", postId)
      .single(),
    supabase
      .from("comments")
      .select("*,author:profiles(username,display_name)")
      .eq("post_id", postId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
  ]);

  if (!post || post.deleted_at) notFound();
  const score = post.votes?.reduce((acc, vote) => acc + vote.value, 0) ?? 0;

  return (
    <section className="space-y-5">
      <article className="rounded-xl border bg-white p-5">
        <div className="mb-2 text-xs text-slate-500">{post.type} • #{post.topic?.slug} • {new Date(post.created_at).toLocaleString()}</div>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="mt-3 whitespace-pre-wrap text-slate-800">{post.body}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>By {post.author?.display_name || post.author?.username || "Unknown"}</span>
          <span>Score: {score}</span>
          {auth.user && (
            <>
              <form action={votePost}><input type="hidden" name="post_id" value={post.id} /><input type="hidden" name="value" value="1" /><button className="rounded border px-2 py-1 text-xs">▲</button></form>
              <form action={votePost}><input type="hidden" name="post_id" value={post.id} /><input type="hidden" name="value" value="-1" /><button className="rounded border px-2 py-1 text-xs">▼</button></form>
              <form action={createReport} className="flex items-center gap-2">
                <input type="hidden" name="post_id" value={post.id} />
                <input type="hidden" name="reason" value="Possible rules violation in post" />
                <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-700">Report</button>
              </form>
            </>
          )}
        </div>
      </article>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Comments</h2>
        {auth.user ? (
          <form action={addComment} className="rounded-xl border bg-white p-4">
            <input type="hidden" name="post_id" value={post.id} />
            <textarea name="body" rows={4} required placeholder="Contribute context or ask clarifying questions." className="w-full" />
            <button className="mt-2 rounded-lg bg-brand px-3 py-2 text-white">Add comment</button>
          </form>
        ) : (
          <p className="text-sm text-slate-600">Please log in to comment.</p>
        )}

        <div className="space-y-2">
          {comments?.map((comment) => (
            <article key={comment.id} className="rounded-lg border bg-white p-3">
              <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{comment.author?.display_name || comment.author?.username || "Unknown"} • {new Date(comment.created_at).toLocaleString()}</span>
                {auth.user && (
                  <form action={createReport}>
                    <input type="hidden" name="comment_id" value={comment.id} />
                    <input type="hidden" name="reason" value="Possible rules violation in comment" />
                    <button className="text-red-700">Report</button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
