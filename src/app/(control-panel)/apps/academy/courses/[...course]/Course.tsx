"use client";

import FusePageSimple from "@fuse/core/FusePageSimple";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "@fuse/core/Link";
import SwipeableViews from "react-swipeable-views";
import { Step, StepContent, StepLabel } from "@mui/material";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import FuseLoading from "@fuse/core/FuseLoading";
import Error404Page from "@/app/(public)/404/Error404Page";
import CourseInfo from "../../CourseInfo";
import CourseProgress from "../../CourseProgress";
import {
  useGetAcademyCourseQuery,
  useUpdateAcademyCourseMutation,
  useGetAcademyCourseStepsQuery,
  CourseStep,
  Course as Courses,
} from "../../AcademyApi";
import CourseStepContent from "./CourseStepContent";
import { supabaseClient } from "@/utils/supabaseClient";

function Course() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const theme = useTheme();
  const pageLayout = useRef(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const params = useParams();
  const [courseId] = params.course as string[];
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [currentCourse, setCurrentCourse] = useState<Courses | undefined>();
  const [courseSteps, setCourseSteps] = useState<CourseStep[]>([]);

  const fetchCourses = async (): Promise<void> => {
    setIsLoading(true);

    let query = supabaseClient
      .from("academy_courses")
      .select("*")
      .eq("id", courseId)
      .single();
    let stepsQuery = supabaseClient
      .from("academy_course_step")
      .select("*")
      .eq("courseId", courseId);

    const { data: result, error } = await query;
    const { data: stepsResult } = await stepsQuery;

    if (error) {
      console.error("Error fetching boards:", error);
      return;
    }
    setCurrentCourse(result || []);
    setCourseSteps(stepsResult || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [courseId]);

  const [updateCourseMutation] = useState(() => useUpdateAcademyCourseMutation);

  const updateCourse = async (courseId: string, data: Partial<Courses>) => {
    const { data: updatedCourse } = await updateCourseMutation({
      courseId,
      data,
    });
    if (updatedCourse) {
      setCurrentCourse(updatedCourse);
    }
  };

  useEffect(() => {
    if (currentCourse && currentCourse.progress?.currentStep === 0) {
      updateCourse(courseId, {
        ...currentCourse,
        progress: {
          currentStep: 1,
          completed: 0,
        },
      });
    }
  }, [currentCourse]);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
  }, [isMobile]);

  const currentStep = currentCourse?.progress?.currentStep || 1;

  function updateCurrentStep(index: number) {
    if (!currentCourse || index < 1 || index > currentCourse.totalSteps) return;

    updateCourse(courseId, {
      ...currentCourse,
      progress: {
        currentStep: index,
        completed:
          index === currentCourse.totalSteps
            ? 1
            : currentCourse.progress.completed,
      },
    });
  }

  function handleNext() {
    updateCurrentStep(currentStep + 1);
  }

  function handleBack() {
    updateCurrentStep(currentStep - 1);
  }

  function handleStepChange(index: number) {
    updateCurrentStep(index + 1);
  }

  if (isLoading) {
    return <FuseLoading />;
  }

  if (!currentCourse) {
    return <Error404Page />;
  }

  return (
    <FusePageSimple
      content={
        <div className="flex flex-col min-h-full w-full relative">
          {!isMobile && (
            <CourseProgress
              className="sticky top-0 z-10"
              course={currentCourse}
            />
          )}

          {isMobile && (
            <Paper
              className="flex sticky top-0 z-10 items-center w-full px-16 py-8 border-b-1 shadow-0"
              square
            >
              <IconButton to="/apps/academy/courses" component={Link}>
                <FuseSvgIcon>
                  {theme.direction === "ltr"
                    ? "heroicons-outline:arrow-left"
                    : "heroicons-outline:arrow-right"}
                </FuseSvgIcon>
              </IconButton>
              <Typography className="text-md font-medium tracking-tight mx-10">
                {currentCourse.title}
              </Typography>
            </Paper>
          )}

          <SwipeableViews
            className="flex flex-col flex-auto w-full min-h-full"
            containerStyle={{ minHeight: "100%" }}
            index={currentStep - 1}
            enableMouseEvents
            onChangeIndex={handleStepChange}
          >
            {courseSteps?.map((step, index: number) => (
              <div
                className="flex justify-center p-16 pb-64 sm:p-24 sm:pb-64 md:p-48 md:pb-96 min-h-full"
                key={index}
              >
                <CourseStepContent step={step} />
              </div>
            ))}
          </SwipeableViews>

          {/* Desktop Navigation Buttons */}
          {!isMobile && (
            <div className="flex justify-center w-full absolute bottom-0 left-0 right-0 p-16 pb-32 z-10">
              <ButtonGroup
                variant="contained"
                className="rounded-full"
                color="secondary"
              >
                <Button
                  startIcon={
                    <FuseSvgIcon>
                      heroicons-outline:arrow-small-left
                    </FuseSvgIcon>
                  }
                  onClick={handleBack}
                  disabled={currentStep <= 1}
                >
                  Prev
                </Button>
                <Button className="pointer-events-none">{`${currentStep}/${currentCourse.totalSteps}`}</Button>
                <Button
                  endIcon={
                    <FuseSvgIcon>
                      heroicons-outline:arrow-small-right
                    </FuseSvgIcon>
                  }
                  onClick={handleNext}
                  disabled={currentStep >= currentCourse.totalSteps}
                >
                  Next
                </Button>
              </ButtonGroup>
            </div>
          )}

          {/* Mobile Navigation Buttons */}
          {isMobile && (
            <Box
              sx={{ backgroundColor: "background.paper" }}
              className="flex sticky bottom-0 z-10 items-center w-full p-16 border-t-1"
            >
              <IconButton
                onClick={() => setLeftSidebarOpen(true)}
                aria-label="open left sidebar"
                size="large"
              >
                <FuseSvgIcon>heroicons-outline:bars-3</FuseSvgIcon>
              </IconButton>

              <Typography className="mx-8">{`${currentStep}/${currentCourse.totalSteps}`}</Typography>

              <CourseProgress
                className="flex flex-1 mx-8"
                course={currentCourse}
              />

              <IconButton onClick={handleBack} disabled={currentStep <= 1}>
                <FuseSvgIcon>heroicons-outline:arrow-small-left</FuseSvgIcon>
              </IconButton>

              <IconButton
                onClick={handleNext}
                disabled={currentStep >= currentCourse.totalSteps}
              >
                <FuseSvgIcon>heroicons-outline:arrow-small-right</FuseSvgIcon>
              </IconButton>
            </Box>
          )}
        </div>
      }
      leftSidebarOpen={leftSidebarOpen}
      leftSidebarOnClose={() => setLeftSidebarOpen(false)}
      leftSidebarWidth={300}
      leftSidebarContent={
        <>
          <div className="p-32">
            <Button
              to="/apps/academy/courses"
              component={Link}
              className="mb-24"
              color="secondary"
              variant="text"
              startIcon={
                <FuseSvgIcon size={20}>
                  {theme.direction === "ltr"
                    ? "heroicons-outline:arrow-small-left"
                    : "heroicons-outline:arrow-small-right"}
                </FuseSvgIcon>
              }
            >
              Back to courses
            </Button>

            <CourseInfo course={currentCourse} />
          </div>
          <Divider />
          <Stepper
            classes={{ root: "p-32" }}
            activeStep={currentStep - 1}
            orientation="vertical"
          >
            {courseSteps?.map((step, index) => (
              <Step
                key={index}
                sx={{
                  "& .MuiStepLabel-root, & .MuiStepContent-root": {
                    cursor: "pointer!important",
                  },
                }}
                onClick={() => handleStepChange(step.order)}
                expanded
              >
                <StepLabel>{step.title}</StepLabel>
                <StepContent>{step.subtitle}</StepContent>
              </Step>
            ))}
          </Stepper>
        </>
      }
      scroll="content"
      ref={pageLayout}
      contentScrollbarsProps={{
        scrollToTopOnChildChange: true,
      }}
    />
  );
}

export default Course;
