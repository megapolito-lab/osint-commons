import Link from "next/link";

interface PostCardProps {
  id: number;
  title: string;
  body: string;
  created_at: string;
  type: "brief" | "discussion";
  topic: { name: string; slug: string } | null;
  author: { username: string | null; display_name: string | null } | null;
  score?: number;
}

export function PostCard({ id, title, body, created_at, type, topic, author, score = 0 }: PostCardProps) {
  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-brand-muted px-2 py-0.5 font-semibold text-brand">{type}</span>
        {topic && <span>#{topic.slug}</span>}
        <span>•</span>
        <span>{new Date(created_at).toLocaleString()}</span>
      </div>
      <Link href={`/p/${id}`} className="text-lg font-semibold hover:text-brand">{title}</Link>
      <p className="mt-2 line-clamp-3 text-sm text-slate-700">{body}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>by {author?.display_name || author?.username || "Unknown"}</span>
        <span>Score: {score}</span>
      </div>
    </article>
  );
}
