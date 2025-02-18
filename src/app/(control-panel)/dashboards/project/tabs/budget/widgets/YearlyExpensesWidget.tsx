import Paper from '@mui/material/Paper';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ApexOptions } from 'apexcharts';
import FuseLoading from '@fuse/core/FuseLoading';
import _ from 'lodash';
import ExpensesDataType from './types/ExpensesDataType';
import { useGetProjectDashboardWidgetsQuery } from '../../../ProjectDashboardApi';
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * The YearlyExpensesWidget widget.
 */
function YearlyExpensesWidget() {
	const { data: widgets, isLoading } = useGetProjectDashboardWidgetsQuery();
	const widget = widgets?.yearlyExpenses as ExpensesDataType;
	const { amount, series, labels } = widget;
	const theme = useTheme();

	const chartOptions: ApexOptions = {
		chart: {
			animations: {
				enabled: false
			},
			fontFamily: 'inherit',
			foreColor: 'inherit',
			height: '100%',
			type: 'line',
			sparkline: {
				enabled: true
			}
		},
		colors: [theme.palette.error.main],
		stroke: {
			curve: 'smooth'
		},
		tooltip: {
			theme: 'dark'
		},
		xaxis: {
			type: 'category',
			categories: labels
		},
		yaxis: {
			labels: {
				formatter: (val) => `$${val}`
			}
		}
	};

	if (isLoading) {
		return <FuseLoading />;
	}

	if (!widget) {
		return null;
	}

	return (
		<Paper className="flex flex-col flex-auto shadow rounded-xl overflow-hidden">
			<div className="flex items-center justify-between pt-8 px-8">
				<div className="px-8 text-lg font-medium tracking-tight leading-6 truncate">Yearly Expenses</div>
				<div className="">
					<IconButton>
						<FuseSvgIcon size={20}>heroicons-solid:ellipsis-vertical</FuseSvgIcon>
					</IconButton>
				</div>
			</div>
			<div className="flex items-center p-16">
				<div className="flex flex-col">
					<div className="text-3xl font-semibold tracking-tight leading-tight">
						{amount.toLocaleString('en-US', {
							style: 'currency',
							currency: 'USD'
						})}
					</div>
					<div className="flex items-center">
						<FuseSvgIcon
							className="mr-4 text-red-500"
							size={20}
						>
							heroicons-solid:trending-up
						</FuseSvgIcon>
						<Typography className="font-medium text-sm text-secondary leading-none whitespace-nowrap">
							<span className="text-red-500">2%</span>
							<span> above projected</span>
						</Typography>
					</div>
				</div>
				<div className="flex flex-col flex-auto ml-32">
					<ReactApexChart
						className="flex-auto w-full h-64"
						options={chartOptions}
						series={_.cloneDeep(series)}
						type={chartOptions?.chart?.type}
						height={chartOptions?.chart?.height}
					/>
				</div>
			</div>
		</Paper>
	);
}

export default YearlyExpensesWidget;
