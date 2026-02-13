import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });

const topics = [
  ["Geopolitics", "geopolitics"],
  ["Cyber Threat Intel", "cyber-threat-intel"],
  ["Disinformation", "disinformation"],
  ["Sanctions & Trade", "sanctions-trade"],
  ["Maritime", "maritime"],
  ["Aviation", "aviation"],
  ["Methodology", "methodology"],
  ["Tools", "tools"],
  ["Investigations", "investigations"],
  ["News Roundup", "news-roundup"],
];

async function seed() {
  const payload = topics.map(([name, slug]) => ({ name, slug }));
  const { error } = await supabase.from("topics").upsert(payload, { onConflict: "slug" });
  if (error) throw error;
  console.log(`Seeded ${payload.length} topics.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
