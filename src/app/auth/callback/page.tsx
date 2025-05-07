'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createPagesBrowserClient();

    const exchangeSession = async () => {
      try {
        const authCode = new URLSearchParams(window.location.search).get('code');
        if (!authCode) {
          throw new Error('Authorization code not found in URL');
        }
        const { error } = await supabase.auth.exchangeCodeForSession(authCode);
        if (error) {
          console.error('Supabase auth error:', error.message);
          router.push('/auth/error');
        } else {
          const params = new URLSearchParams(window.location.hash.slice(1));
          const type = params.get('type');

          if (type === 'recovery') {
            router.push('/auth/set-password');
          } else {
            router.push('/dashboards/project');
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        router.push('/auth/error');
      }
    };

    exchangeSession();
  }, [router]);

  return <p>Loading...</p>;
}
