import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export type ProStatus = 'free' | 'pro';

export interface UserRow {
  id: string; // Supabase Auth user ID
  essay_submissions: number;
  relevance_checks: number;
  citation_uses: number;
  pro_status: ProStatus;
}

export async function upsertUser(user: UserRow) {
  const { data, error } = await supabase
    .from('users')
    .upsert([user], { onConflict: 'id' });
  if (error) throw error;
  return data;
} 