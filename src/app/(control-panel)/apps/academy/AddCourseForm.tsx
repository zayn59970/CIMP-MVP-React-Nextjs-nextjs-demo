// components/AddCourseForm.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Grid,
  Paper,
} from "@mui/material";
import { supabaseClient } from "@/utils/supabaseClient";
import { v4 as uuidv4 } from "uuid";

const AddCourseForm = ({ categories }: { categories: { id: string; title: string }[] }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState<number>(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!title || !description || !category || !pdfFile) return;
    setLoading(true);

    const fileExt = pdfFile.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("course-images")
      .upload(filePath, pdfFile);

    if (uploadError) {
      console.error("Upload error", uploadError);
      setLoading(false);
      return;
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from("course-images")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabaseClient
      .from("academy_courses")
      .insert([
        {
          title,
          description,
          category,
          duration,
          totalSteps: 0,
          updatedAt: new Date().toISOString(),
          featured: false,
          content_url: publicUrlData.publicUrl,
        },
      ]);

    if (insertError) {
      console.error("Insert error", insertError);
    } else {
      alert("Course added successfully!");
      setTitle("");
      setDescription("");
      setCategory("");
      setDuration(0);
      setPdfFile(null);
    }

    setLoading(false);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 700, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Add New Course
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            select
            label="Category"
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.title}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Duration (minutes)"
            type="number"
            fullWidth
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="outlined" component="label">
            Upload PDF
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setPdfFile(e.target.files[0]);
                }
              }}
            />
          </Button>
          {pdfFile && <Typography mt={1}>{pdfFile.name}</Typography>}
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading}
            fullWidth
          >
            {loading ? "Uploading..." : "Add Course"}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AddCourseForm;
