'use client';

import FusePageSimple from '@fuse/core/FusePageSimple';
import { useState,useEffect } from 'react';
import { styled } from '@mui/material/styles';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseTabs from 'src/components/tabs/FuseTabs';
import FuseTab from 'src/components/tabs/FuseTab';
import ProjectDashboardAppHeader from './ProjectDashboardAppHeader';
import HomeTab from './tabs/home/HomeTab';
import TeamTab from './tabs/team/TeamTab';
import BudgetTab from './tabs/budget/BudgetTab';
import { useGetProjectDashboardWidgetsQuery } from './ProjectDashboardApi';
import { useSession } from 'next-auth/react';
import { supabaseClient } from "@/utils/supabaseClient";
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		boxShadow: `inset 0 -1px 0 0px  ${theme.palette.divider}`
	}
}));

/**
 * The ProjectDashboardApp page.
 */
function ProjectDashboardApp() {
	const router = useRouter();

	useEffect(() => {
		const supabase = createPagesBrowserClient();
	
		const handleInviteRedirect = async () => {
			const hash = window.location.hash;
			if (hash.includes('access_token')) {
				const authCode = new URLSearchParams(window.location.search).get('code');
				if (!authCode) {
					throw new Error('Authorization code not found in URL');
				}
				const { error } = await supabase.auth.exchangeCodeForSession(authCode);
	
				if (error) {
					console.error('Session exchange error:', error.message);
					router.push('/auth/error');
				} else {
					const params = new URLSearchParams(hash.slice(1));
					const type = params.get('type');
					if (type === 'recovery') {
						router.push('/auth/set-password'); // custom page where user sets their first password
					} else {
						router.push('/dashboard'); // fallback if needed
					}
				}
			}
		};
	
		handleInviteRedirect();
	}, [router]);
	const { isLoading } = useGetProjectDashboardWidgetsQuery();
	const [tabValue, setTabValue] = useState('home');

	function handleTabChange(event: React.SyntheticEvent, value: string) {
		setTabValue(value);
	}

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<Root
			header={<ProjectDashboardAppHeader />}
			content={
				<div className="w-full pt-16 sm:pt-24">
					<div className="w-full px-24 md:px-32">
						<FuseTabs
							value={tabValue}
							onChange={handleTabChange}
							aria-label="New user tabs"
						>
							<FuseTab
								value="home"
								label="Home"
							/>
							{/* <FuseTab
								value="budget"
								label="Budget"
							/> */}
							<FuseTab
								value="team"
								label="Team"
							/>
						</FuseTabs>
					</div>
					{tabValue === 'home' && <HomeTab />}
					{/* {tabValue === 'budget' && <BudgetTab />} */}
					{tabValue === 'team' && <TeamTab />}
				</div>
			}
		/>
	);
}

export default ProjectDashboardApp;
