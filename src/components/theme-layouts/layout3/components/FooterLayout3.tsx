import AppBar from '@mui/material/AppBar';
import { ThemeProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import clsx from 'clsx';
import { memo } from 'react';
import { useFooterTheme } from '@fuse/core/FuseSettings/hooks/fuseThemeHooks';

type FooterLayout3Props = {
	className?: string;
};

/**
 * The footer layout 3.
 */
function FooterLayout3(props: FooterLayout3Props) {
	const { className = '' } = props;

	const footerTheme = useFooterTheme();

	return (
		<ThemeProvider theme={footerTheme}>
			<AppBar
				id="fuse-footer"
				className={clsx('relative z-20 shadow-md', className)}
				color="default"
				style={{ backgroundColor: footerTheme.palette.background.paper }}
			>
				
			</AppBar>
		</ThemeProvider>
	);
}

export default memo(FooterLayout3);
