import { useState, useEffect } from 'react';
import { supabaseClient } from '@/utils/supabaseClient';

function useSelectMember(id: string) {
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchMember = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          setError(error.message);
        } else {
          setMember(data);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  return { member, loading, error };
}

export default useSelectMember;
