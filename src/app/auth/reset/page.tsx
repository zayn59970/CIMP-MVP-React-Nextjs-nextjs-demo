'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Exchange access_token from URL for a session
  useEffect(() => {
    const url = new URL(window.location.href);
    const access_token = url.searchParams.get('access_token');

    if (!access_token) {
      setErrorMsg('Missing access token in URL.');
      setLoading(false);
      return;
    }

    const restoreSession = async () => {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token: url.searchParams.get('refresh_token') ?? '',
      });

      if (error) {
        setErrorMsg('Failed to restore session.');
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  // Step 2: Handle password update
  const handlePasswordReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setSuccessMsg('Password updated! Redirecting...');
      setTimeout(() => {
        router.push('/dashboards/project'); // or wherever
      }, 1500);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Set Your Password</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 10 }}
      />
      <button onClick={handlePasswordReset} disabled={!password}>
        Update Password
      </button>
    </div>
  );
}
