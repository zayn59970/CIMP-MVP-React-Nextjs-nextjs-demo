import AppBar from '@mui/material/AppBar';
import { ThemeProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import clsx from 'clsx';
import { memo } from 'react';
import { useFooterTheme } from '@fuse/core/FuseSettings/hooks/fuseThemeHooks';

type FooterLayout2Props = {
	className?: string;
};

/**
 * The footer layout 2.
 */
function FooterLayout2(props: FooterLayout2Props) {
	const { className = '' } = props;
	const footerTheme = useFooterTheme();

	return (
		<ThemeProvider theme={footerTheme}>
			<AppBar
				id="fuse-footer"
				className={clsx('relative z-20 shadow-md', className)}
				color="default"
				sx={{ backgroundColor: footerTheme.palette.background.paper }}
			>
				
			</AppBar>
		</ThemeProvider>
	);
}

export default memo(FooterLayout2);
