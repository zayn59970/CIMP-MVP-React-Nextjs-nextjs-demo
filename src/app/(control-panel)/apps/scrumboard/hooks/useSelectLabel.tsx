import { useState, useEffect } from 'react';
import { supabaseClient } from '@/utils/supabaseClient';

type useSelectLabelProps = {
	id: string;
};

function useSelectLabel(props: useSelectLabelProps) {
	const {  id } = props;
	const [label, setLabel] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	
	useEffect(() => {
	  if (!id) return;
  
	  const fetchMember = async () => {
		setLoading(true);
		setError(null);
		try {
		  const { data, error } = await supabaseClient
			.from('scrumboard_label')
			.select('*')
			.eq('id', id)
			.single();
  
		  if (error) {
			setError(error.message);
		  } else {
			setLabel(data);
		  }
		} catch (err) {
		  setError((err as Error).message);
		} finally {
		  setLoading(false);
		}
	  };
  
	  fetchMember();
	}, [id]);
  
	return { label, loading, error };
  }

export default useSelectLabel;
