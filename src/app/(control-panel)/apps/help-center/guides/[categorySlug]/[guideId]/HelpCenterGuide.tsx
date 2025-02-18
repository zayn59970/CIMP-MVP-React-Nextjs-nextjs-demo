"use client";

import { useParams, useRouter } from "next/navigation";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import PageBreadcrumb from "src/components/PageBreadcrumb";
import DemoContent from "@fuse/core/DemoContent";
import {
  Guide,
  useGetHelpCenterGuideByIdQuery,
  useGetHelpCenterGuideCategoryByIdQuery,
  useGetHelpCenterGuidesQuery,
} from "../../../HelpCenterApi";
import { useEffect, useState } from "react";
import FuseLoading from "@fuse/core/FuseLoading";
import { formatDistanceToNow } from "date-fns";

/**
 * The help center guide.
 */
function HelpCenterGuide() {
  const router = useRouter();
  const routeParams = useParams<{ guideId: string }>();
  const { guideId } = routeParams;

  const [guide, setGuide] = useState<Guide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);

  // Fetch the current guide
  const fetchGuide = async () => {
    setIsLoading(true);
    const { data, error } = await useGetHelpCenterGuideByIdQuery(guideId);

    if (error) {
      setError(error.message);
    } else {
      setGuide(data);
    }

    setIsLoading(false);
  };

  // Fetch all guides
  const fetchGuides = async () => {
    const { data, error } = await useGetHelpCenterGuidesQuery();

    if (!error) {
      setGuides(data);
    }
  };

  // Fetch category slug by category ID
  const fetchCategorySlug = async (categoryId: string) => {
    const { data, error } =
      await useGetHelpCenterGuideCategoryByIdQuery(categoryId);
    return error ? null : data.slug;
  };

  useEffect(() => {
    fetchGuide();
    fetchGuides();
  }, [guideId]);

  if (isLoading) return <FuseLoading />;
  if (!guide) return null;

  // Convert createdAt to relative time
  const relativeTime = guide.createdAt
    ? formatDistanceToNow(new Date(guide.createdAt), { addSuffix: true })
    : "";

  // Find the next guide
  const currentIndex = guides.findIndex((g) => g.id === guideId);
  const nextGuide =
    currentIndex !== -1 && currentIndex < guides.length - 1
      ? guides[currentIndex + 1]
      : null;

  // Function to navigate to the next guide
  const handleNextGuide = async () => {
    if (nextGuide) {
      const categorySlug = await fetchCategorySlug(nextGuide.categoryId);
      if (categorySlug) {
        router.push(`/apps/help-center/guides/${categorySlug}/${nextGuide.id}`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-24 sm:p-40 container">
      <div className="flex flex-col w-full max-w-4xl">
        <div className="sm:mt-32">
          <PageBreadcrumb />
        </div>

        <Typography className="mt-8 text-4xl sm:text-7xl font-extrabold tracking-tight leading-tight">
          {guide.title}
        </Typography>

        <Typography
          className="mt-8 sm:text-2xl tracking-tight"
          color="text.secondary"
        >
          {guide.subtitle}
        </Typography>

        <div
          className="mt-32 sm:mt-48 max-w-none prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: guide.content }}
        />

        {/* <DemoContent /> */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-40 pt-32 border-t">
          <Typography className="text-sm font-medium" color="text.secondary">
            Last updated {relativeTime}
          </Typography>
          <div className="flex items-center mt-8 sm:mt-0">
            <Typography className="font-medium mx-8" color="text.secondary">
              Was this page helpful?
            </Typography>
            <IconButton>
              <FuseSvgIcon>heroicons-outline:thumb-up</FuseSvgIcon>
            </IconButton>
            <IconButton>
              <FuseSvgIcon>heroicons-outline:thumb-down</FuseSvgIcon>
            </IconButton>
          </div>
        </div>

        {nextGuide && (
          <Card
            onClick={handleNextGuide}
            className="mt-32 flex items-center justify-between p-24 sm:px-40 rounded-xl shadow hover:shadow-lg transition-shadow ease-in-out duration-150 cursor-pointer"
          >
            <div>
              <Typography color="text.secondary">Next</Typography>
              <Typography className="text-lg font-semibold">
                {nextGuide.title}
              </Typography>
            </div>
            <FuseSvgIcon className="ml-12">
              heroicons-outline:arrow-right
            </FuseSvgIcon>
          </Card>
        )}
      </div>
    </div>
  );
}

export default HelpCenterGuide;
