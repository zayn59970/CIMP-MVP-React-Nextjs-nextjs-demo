"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "src/components/PageBreadcrumb";
import _ from "lodash";
import GuideListMenu from "../GuideListMenu";
import {
  useGetHelpCenterGuideCategoriesQuery,
  useGetHelpCenterGuidesByCategoryQuery,
} from "../../HelpCenterApi";
import FuseLoading from "@fuse/core/FuseLoading";

/**
 * The guide category.
 */
function GuideCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  const [guides, setGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingGuides, setIsLoadingGuides] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories first
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      const { data, error } = await useGetHelpCenterGuideCategoriesQuery();

      if (error) {
        setError(error.message);
      } else {
        setCategories(data);
      }

      setIsLoadingCategories(false);
    };

    fetchCategories();
  }, []);

  // Get the category object from slug
  const category = useMemo(
    () => _.find(categories, { slug: categorySlug }),
    [categories, categorySlug]
  );

  // Fetch guides when category is available
  useEffect(() => {
    if (!category) return;

    const fetchGuides = async () => {
      setIsLoadingGuides(true);
      const { data, error } = await useGetHelpCenterGuidesByCategoryQuery(
        category.id
      );

      if (error) {
        setError(error.message);
      } else {
        setGuides(data);
      }

      setIsLoadingGuides(false);
    };

    fetchGuides();
  }, [category]);
  if (isLoadingCategories || isLoadingGuides) return <FuseLoading />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col items-center p-24 sm:p-40 container">
      <div className="flex flex-col w-full max-w-4xl">
        <div className="sm:mt-32">
          <PageBreadcrumb />
        </div>
        <div className="mt-8 text-4xl sm:text-7xl font-extrabold tracking-tight leading-tight">
          {category?.title || "Category Not Found"}
        </div>
        <div className="mt-32 sm:mt-48">
          <GuideListMenu list={guides} categorySlug={categorySlug} />
        </div>
      </div>
    </div>
  );
}

export default GuideCategory;
