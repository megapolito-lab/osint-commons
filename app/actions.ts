"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

const postSchema = z.object({
  title: z.string().min(5).max(140),
  body: z.string().min(10).max(5000),
  topic_id: z.coerce.number().positive(),
  type: z.enum(["brief", "discussion"]),
});

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const parsed = postSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid post data");

  await supabase.from("posts").insert({ ...parsed.data, author_id: auth.user.id });
  revalidatePath("/");
  redirect("/");
}

export async function addComment(formData: FormData) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const post_id = Number(formData.get("post_id"));
  const body = String(formData.get("body") ?? "");
  if (!body.trim()) throw new Error("Comment body required");

  await supabase.from("comments").insert({ post_id, body, author_id: auth.user.id });
  revalidatePath(`/p/${post_id}`);
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  await supabase
    .from("profiles")
    .update({
      username: String(formData.get("username") ?? "").slice(0, 32),
      display_name: String(formData.get("display_name") ?? "").slice(0, 64),
      bio: String(formData.get("bio") ?? "").slice(0, 280),
      avatar_url: String(formData.get("avatar_url") ?? "").slice(0, 255),
    })
    .eq("id", auth.user.id);

  revalidatePath("/profile");
}

export async function toggleTopicFollow(formData: FormData) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const topicId = Number(formData.get("topic_id"));
  const shouldFollow = formData.get("should_follow") === "true";

  if (shouldFollow) {
    await supabase.from("follows_topics").insert({ user_id: auth.user.id, topic_id: topicId });
  } else {
    await supabase.from("follows_topics").delete().eq("user_id", auth.user.id).eq("topic_id", topicId);
  }

  revalidatePath("/topics");
  revalidatePath("/");
}

export async function votePost(formData: FormData) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const post_id = Number(formData.get("post_id"));
  const value = Number(formData.get("value"));
  if (![1, -1].includes(value)) throw new Error("Invalid vote");

  await supabase.from("votes").upsert({ user_id: auth.user.id, post_id, value });
  revalidatePath("/");
  revalidatePath(`/p/${post_id}`);
}

export async function createReport(formData: FormData) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  await supabase.from("reports").insert({
    reporter_id: auth.user.id,
    post_id: formData.get("post_id") ? Number(formData.get("post_id")) : null,
    comment_id: formData.get("comment_id") ? Number(formData.get("comment_id")) : null,
    reason: String(formData.get("reason") ?? "Potential policy violation"),
  });

  revalidatePath("/moderation");
}

export async function updateReportStatus(formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("reports")
    .update({ status: String(formData.get("status") ?? "reviewed") })
    .eq("id", Number(formData.get("report_id")));
  revalidatePath("/moderation");
}

export async function softDeletePost(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("posts").update({ deleted_at: new Date().toISOString() }).eq("id", Number(formData.get("post_id")));
  revalidatePath("/");
  revalidatePath("/moderation");
}

export async function softDeleteComment(formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", Number(formData.get("comment_id")));
  revalidatePath("/moderation");
}
