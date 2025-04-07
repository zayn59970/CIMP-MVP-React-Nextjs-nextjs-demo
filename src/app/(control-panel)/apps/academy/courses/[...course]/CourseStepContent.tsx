import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import FuseLoading from '@fuse/core/FuseLoading';
import { CourseStep,CourseStepContent as Content, useGetAcademyCourseStepContentQuery } from '../../AcademyApi';
import { useEffect, useState } from 'react';
import PdfViewer from './PdfViewer';

type CourseStepContentProps = {
	step: CourseStep;
};

function CourseStepContent(props: CourseStepContentProps) {
	const { step } = props;
	const pdfUrl = 'https://qleyfxeyojompzmypiop.supabase.co/storage/v1/object/public/course-images//Daily%20Report%203-4-2025.pdf';  // Replace with your PDF URL

	const theme = useTheme();
	const [stepContent, setStepContent] = useState<Content>();
	
	  const [loading, setloading] = useState(true);
	
	  const fetctStepContent = async () => {
		setloading(true);
		const { data: stepContent } = await useGetAcademyCourseStepContentQuery(step?.id);
		if (stepContent) {
			setStepContent(stepContent);
		} 
		
	
		setloading(false);
	  };
	
	  /** Subscribe to real-time changes */
	  useEffect(() => {
		fetctStepContent();
	  }, []);

console.log("Step Content", stepContent);

	if (loading) {
		return <FuseLoading />;
	}

	return (
		<Paper className="w-full max-w-lg mx-auto sm:my-8 lg:mt-16 p-24 sm:p-40 sm:py-48 rounded-xl shadow overflow-hidden">
			<Typography
				variant="h4"
				className="mb-16 font-500"
			>
				{step?.title}
			</Typography>

			<Typography
				className="text-2xl mb-32"
				variant="h5"
			>
				{step?.subtitle}
			</Typography>
			<PdfViewer pdfUrl={pdfUrl} />
			{/* <div
				className="prose prose-sm dark:prose-invert w-full max-w-full"
				dangerouslySetInnerHTML={{ __html: stepContent?.html || '' }}
				dir={theme.direction}
			/> */}
		</Paper>
	);
}

export default CourseStepContent;
