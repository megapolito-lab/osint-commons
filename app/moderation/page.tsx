import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { softDeleteComment, softDeletePost, updateReportStatus } from "@/app/actions";

export default async function ModerationPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) notFound();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  if (!profile || (profile.role !== "moderator" && profile.role !== "admin")) notFound();

  const { data: reports } = await supabase
    .from("reports")
    .select("*,post:posts(id,title),comment:comments(id,body)")
    .eq("status", "open")
    .order("created_at", { ascending: true });

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Moderation queue</h1>
      {!reports?.length && <p className="text-sm text-slate-600">No open reports.</p>}
      <div className="space-y-3">
        {reports?.map((report) => (
          <article key={report.id} className="rounded-xl border bg-white p-4">
            <p className="text-sm"><strong>Reason:</strong> {report.reason}</p>
            <p className="text-xs text-slate-500">Submitted: {new Date(report.created_at).toLocaleString()}</p>
            {report.post && <p className="mt-2 text-sm">Post #{report.post.id}: {report.post.title}</p>}
            {report.comment && <p className="mt-2 text-sm">Comment #{report.comment.id}: {report.comment.body}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={updateReportStatus}>
                <input type="hidden" name="report_id" value={report.id} />
                <input type="hidden" name="status" value="reviewed" />
                <button className="rounded border px-3 py-1 text-xs">Mark reviewed</button>
              </form>
              <form action={updateReportStatus}>
                <input type="hidden" name="report_id" value={report.id} />
                <input type="hidden" name="status" value="actioned" />
                <button className="rounded border px-3 py-1 text-xs">Mark actioned</button>
              </form>
              {report.post_id && (
                <form action={softDeletePost}>
                  <input type="hidden" name="post_id" value={report.post_id} />
                  <button className="rounded border border-red-300 px-3 py-1 text-xs text-red-700">Soft delete post</button>
                </form>
              )}
              {report.comment_id && (
                <form action={softDeleteComment}>
                  <input type="hidden" name="comment_id" value={report.comment_id} />
                  <button className="rounded border border-red-300 px-3 py-1 text-xs text-red-700">Soft delete comment</button>
                </form>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
