"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import FileManagerApi from "./FileManagerApi";
import { useSession } from "next-auth/react";
import useFileManagerData from "./hooks/useFileManagerData";

export default function UploadPopup({ open, onClose }) {
  const [folders, setFolders] = useState([]);
  const [mode, setMode] = useState("folder"); // "folder" or "file"
  const [folderName, setFolderName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [loading, setLoading] = useState(false);
  const { data } = useSession();
  const createdBy = data.db.id || "unknown-user";
  const { refetch } = useFileManagerData(); // Import fetchData

  useEffect(() => {
    async function fetchFolders() {
      const response = await FileManagerApi.useGetFileManagerAllFolderItemsQuery();
      if (response.data) setFolders(response.data);
    }
    fetchFolders();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    let response;
    if (mode === "folder") {
        response = await FileManagerApi.useCreateFolderMutation({
            name: folderName,
            createdBy,
            description,
        });
    } else if (mode === "file") {
        if (!(selectedFile instanceof File)) {
            alert("Invalid file. Please select a valid file.");
            setLoading(false);
            return;
        }

        response = await FileManagerApi.useUploadFileMutation({
            file: selectedFile,
            folderName: folders.find((folder) => folder.id === selectedFolder)?.name || "files",
            folderId: selectedFolder || 'root',
            createdBy,
        });
    }

    if (response?.error) {
        console.error("Error:", response.error);
    } 
      refetch(); // Manually refresh data
    

    setLoading(false);
    onClose();
};
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{mode === "folder" ? "Create Folder" : "Upload File"}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Choose Action</InputLabel>
          <Select value={mode} onChange={(e) => setMode(e.target.value)}>
            <MenuItem value="folder">Create Folder</MenuItem>
            <MenuItem value="file">Upload File</MenuItem>
          </Select>
        </FormControl>

        {mode === "folder" ? (
          <>
            <TextField
              label="Folder Name"
              fullWidth
              margin="normal"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
            <TextField
              label="Description (Optional)"
              fullWidth
              margin="normal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </>
        ) : (
          <>
            <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Folder (Optional)</InputLabel>
              <Select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}>
                <MenuItem value="">No Folder</MenuItem>
                {folders.map((folder) => (
                  <MenuItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading} variant="contained" color="primary">
          {loading ? "Processing..." : mode === "folder" ? "Create Folder" : "Upload File"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
