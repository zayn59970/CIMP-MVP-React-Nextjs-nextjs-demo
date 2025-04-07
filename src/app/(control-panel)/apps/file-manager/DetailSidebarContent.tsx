import Typography from "@mui/material/Typography";
import { motion } from "motion/react";
import { useAppDispatch } from "src/store/hooks";
import IconButton from "@mui/material/IconButton";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { lighten } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useEffect } from "react";
import usePathname from "@fuse/hooks/usePathname";
import ItemIcon from "./ItemIcon";
import { resetSelectedItemId } from "./fileManagerAppSlice";
import useFileManagerData from "./hooks/useFileManagerData";
import { supabaseClient } from "@/utils/supabaseClient";

function DetailSidebarContent() {
  const { selectedItem } = useFileManagerData();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetSelectedItemId());
  }, [dispatch, pathname]);

  if (!selectedItem) {
    return null;
  }

  // 🟢 Download File Function
  const handleDownload = async () => {
    if (!selectedItem.contents) return;

    try {
      const response = await fetch(selectedItem.contents);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = selectedItem.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
//   🔴 Delete File Function

const handleDelete = async () => {
  if (!selectedItem) return;

  try {
    if (selectedItem.type === "folder") {
      // Step 1: Delete folder metadata from Firestore
      const { error: dbError } = await supabaseClient
        .from("file_manager_item")
        .delete()
        .match({ id: selectedItem.id });

      if (dbError) throw dbError;
      console.log("Folder metadata deleted successfully");

      // Step 2: Get all files related to the folder
      const { data: folderFiles, error: folderError } = await supabaseClient
        .from("file_manager_item")
        .select("name")
        .eq("folderId", selectedItem.id);

      if (folderError) throw folderError;

      if (folderFiles && folderFiles.length > 0) {
        // Step 3: Delete each file in the folder from Supabase Storage
        const fileNames = folderFiles.map((file) => file.name);
        const { error: storageError } = await supabaseClient.storage
          .from("files") // Make sure the bucket is correct
          .remove(fileNames);

        if (storageError) throw storageError;
        console.log("All files in the folder deleted successfully");
      }
      dispatch(resetSelectedItemId()); // Close sidebar after deletion

      return;
    }

    // File Deletion Process
    if (!selectedItem.contents) return;

    let bucketName = "files"; // Default bucket
    if (selectedItem.folderId !== "root") {
      // Fetch the folder row to get its name
      const { data: folderData, error: folderError } = await supabaseClient
        .from("file_manager_item")
        .select("name")
        .eq("id", selectedItem.folderId)
        .single();

      if (folderError) throw folderError;
      if (folderData) bucketName = folderData.name;
    }

    // Step 4: Remove the file from Supabase Storage
    const { error: storageError } = await supabaseClient.storage
      .from(bucketName)
      .remove([selectedItem.name]);

    if (storageError) throw storageError;
    console.log("File deleted successfully from storage");

    // Step 5: Remove file metadata from Firestore
    const { error: dbError } = await supabaseClient
      .from("file_manager_item")
      .delete()
      .match({ id: selectedItem.id });

    if (dbError) throw dbError;

    console.log("File metadata deleted successfully");
    dispatch(resetSelectedItemId()); // Close sidebar after deletion
  } catch (error) {
    console.error("Delete failed:", error);
  }
};

  
  return (
    <motion.div
      initial={{ y: 50, opacity: 0.8 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
      className="file-details p-24 sm:p-32"
    >
      <div className="flex items-center justify-end w-full">
        <IconButton onClick={() => dispatch(resetSelectedItemId())}>
          <FuseSvgIcon>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </div>
      <Box
        className="w-full rounded-lg border preview h-128 sm:h-256 file-icon flex items-center justify-center my-32"
        sx={(theme) => ({
          backgroundColor: lighten(theme.palette.background.default, 0.02),
          ...theme.applyStyles("light", {
            backgroundColor: lighten(theme.palette.background.default, 0.4),
          }),
        })}
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
          <ItemIcon type={selectedItem.type} />
        </motion.div>
      </Box>
      <Typography className="text-17 font-medium">{selectedItem.name}</Typography>
      <div className="text-15 font-medium mt-32">Information</div>
      <div className="flex flex-col mt-16 border-t border-b divide-y font-medium">
        <div className="flex items-center justify-between py-12">
          <Typography color="text.secondary">Created By</Typography>
          <Typography>{selectedItem.createdBy}</Typography>
        </div>
        <div className="flex items-center justify-between py-12">
          <Typography color="text.secondary">Created At</Typography>
          <Typography>{selectedItem.createdAt}</Typography>
        </div>
        <div className="flex items-center justify-between py-12">
          <Typography color="text.secondary">Modified At</Typography>
          <Typography>{selectedItem.modifiedAt}</Typography>
        </div>
		{selectedItem.size && (
        <div className="flex items-center justify-between py-12">
          <Typography color="text.secondary">Size</Typography>
          <Typography>{selectedItem.size}</Typography>
        </div>
		)}
        {selectedItem.contents && (
          <div className="flex items-center justify-between py-12">
            <Typography color="text.secondary">Contents</Typography>
            <Typography>{selectedItem.contents}</Typography>
          </div>
        )}
      </div>
      {selectedItem.description && (
        <>
          <div className="text-15 font-medium mt-32 pb-16 border-b">Description</div>
          <Typography className="py-12">{selectedItem.description}</Typography>
        </>
      )}
      <div className={`grid gap-16 w-full mt-32 ${selectedItem.type != "folder" ? " grid-cols-2" : " grid-cols-1"}`}>
	  {selectedItem.type != "folder" && (

        <Button className="flex-auto" color="secondary" variant="contained" onClick={handleDownload}>
          Download
        </Button>
		)}
        <Button className="flex-auto" color="error" variant="contained" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </motion.div>
  );
}

export default DetailSidebarContent;
