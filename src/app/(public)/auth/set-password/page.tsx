'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();
  const supabase = createPagesBrowserClient();
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.hash.substring(1) : '')
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')

  if (access_token && refresh_token) {
      supabase.auth.setSession({
          access_token,
          refresh_token
      }).then((res) => {
          if (res.error) {
              console.error("error msg", res.error.message)
          }
           console.log("session data", res.data)
      })
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      alert('Error setting password: ' + error.message);
    } else {
      alert('Password updated!');
      router.push('/dashboards/project'); // Or login screen
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-12">
      <h1 className="text-lg font-bold">Set Your Password</h1>
      <input
        type="password"
        placeholder="New Password"
        className="border p-2 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded">
        Set Password
      </button>
    </form>
  );
}
