import MainLayout from 'src/components/MainLayout';
import AuthGuardRedirect from '@auth/AuthGuardRedirect';

function Layout({ children }) { 
	
	return (
		<AuthGuardRedirect auth={['admin','user']}>
			<MainLayout>{children}</MainLayout>
		</AuthGuardRedirect>
	);
}

export default Layout;
