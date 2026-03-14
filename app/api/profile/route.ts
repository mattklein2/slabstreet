import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const supabase = await createClient();

  // Verify the user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();

  // Whitelist allowed fields
  const allowed = [
    'display_name', 'zip_code', 'collector_level',
    'favorite_leagues', 'favorite_teams', 'favorite_players',
    'notify_drops', 'notify_shows', 'notify_recap',
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
