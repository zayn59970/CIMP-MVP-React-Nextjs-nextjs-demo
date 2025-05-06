import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // First, fetch the user ID from Supabase Auth
    const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
    if (fetchError) throw fetchError;

    const user = users.users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'User not found in auth' }, { status: 404 });
    }

    const authUserId = user.id;

    // Delete from auth
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
    if (deleteAuthError) throw deleteAuthError;

    // Delete from your `users` table
    const { error: deleteUserTableError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('email', email);

    if (deleteUserTableError) throw deleteUserTableError;

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
