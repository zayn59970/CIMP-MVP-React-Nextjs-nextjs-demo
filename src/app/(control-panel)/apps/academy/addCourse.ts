// utils/addCourse.ts
import { supabaseClient } from "@/utils/supabaseClient";

export const addCourse = async (courseData: {
  title: string;
  slug: string;
  description: string;
  category: string;
  duration: number;
  featured: boolean;
  pdfFile: File;
}) => {
  const fileName = `${Date.now()}_${courseData.pdfFile.name}`;

  // Upload PDF to 'course-images' bucket
  const { data: fileData, error: uploadError } = await supabaseClient.storage
    .from("course-images")
    .upload(fileName, courseData.pdfFile);

  if (uploadError) {
    throw uploadError;
  }

  const publicURL = supabaseClient.storage
    .from("course-images")
    .getPublicUrl(fileName).data.publicUrl;

  // Save course to database
  const { data, error } = await supabaseClient
    .from("academy_courses")
    .insert([
      {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        category: courseData.category,
        duration: courseData.duration,
        featured: courseData.featured,
        pdf_url: publicURL, // Make sure you add this column to your table
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
