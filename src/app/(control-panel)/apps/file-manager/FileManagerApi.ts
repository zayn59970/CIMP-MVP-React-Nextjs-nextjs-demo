import { supabaseClient } from "@/utils/supabaseClient";

export const addTagTypes = ["file_manager_folder"] as const;

const FileManagerApi = {
  useGetFileManagerAllFolderItemsQuery: async () => {
    try {
      const { data, error } = await supabaseClient
        .from("file_manager_item")
        .select("*")
        .eq("type", "folder");

      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },
  useGetFileManagerAllFilesItemsQuery: async () => {
    try {
      const { data, error } = await supabaseClient
        .from("file_manager_item")
        .select("*")
        .neq("type", "folder");

      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },
  useGetFileManagerAllItemsQuery: async () => {
    try {
      const { data, error } = await supabaseClient
        .from("file_manager_item")
        .select("*");

      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },
  useGetFileManagerFolderQuery: async (folderId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from("file_manager_item")
        .select("*")
        .eq("folderId", folderId);

      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  useUpdateFileManagerFolderMutation: async ({
    folderId,
    fileManagerItem,
  }: UpdateFileManagerFolderApiArg) => {
    try {
      const { data, error } = await supabaseClient
        .from("file_manager_item")
        .update(fileManagerItem)
        .eq("id", folderId);

      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  useDeleteFileManagerFolderMutation: async (folderId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from("file_manager_item")
        .delete()
        .eq("id", folderId);

      if (error) throw error;
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },

  useUploadFileMutation: async ({
    file,
    folderId,
    createdBy,
    folderName,
  }: UploadFileApiArg) => {
    try {
      const filePath = `${file.name}`;
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from(folderName)
        .upload(filePath, file);
  
      if (uploadError) throw uploadError;
  
      const publicUrl = supabaseClient.storage
        .from(folderName)
        .getPublicUrl(filePath).data.publicUrl;
  
      // Convert file size to MB and format it
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(3) + "MB"; 
  
      // Extract file extension and convert to uppercase
      const fileExtension = file.name.split('.').pop()?.toUpperCase() || "UNKNOWN";
  
      const fileMetadata: FileManagerItem = {
        id: crypto.randomUUID(),
        folderId,
        name: file.name,
        createdBy,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        size: fileSizeInMB, // ✅ Formatted as "2.50MB"
        type: fileExtension, // ✅ Now formatted as "PNG" or "PDF"
        contents: publicUrl,
        description: "",
      };
  
      const { data, error } = await supabaseClient
        .from("file_manager_item")
        .insert(fileMetadata)
        .select("*")
        .single();
  
      if (error) throw error;
  
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },
  
  useCreateFolderMutation: async ({
    name,
    createdBy,
    description,
  }: {
    name: string;
    createdBy: string;
    description: string;
  }) => {
    try {
      const folderData = {
        id: crypto.randomUUID(),
        name,
        type: "folder",
        createdBy,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        description,
      };
  
      // Insert the folder data into the "file_manager_item" table
      const { data, error } = await supabaseClient
        .from("file_manager_item")
        .insert(folderData)
        .select("*")
        .single();
  
      if (error) throw error;
  
      // Check if a storage bucket with the same name exists
      const { data: existingBuckets, error: bucketError } = await supabaseClient
        .storage.listBuckets();
  
      if (bucketError) throw bucketError;
  
      const bucketExists = existingBuckets.some(bucket => bucket.name === name);
  
      if (!bucketExists) {
        // Create a storage bucket with the same name as the folder
        const { error: createBucketError } = await supabaseClient.storage.createBucket(name);
  
        if (createBucketError) throw createBucketError;
      }
  
      return { data, isLoading: false, error: null };
    } catch (error) {
      return { data: null, isLoading: false, error };
    }
  },
  
  
};

export default FileManagerApi;

export type GetFileManagerAllFolderItemsApiResponse = FileManagerItem[];
export type GetFileManagerAllFolderItemsApiArg = null;

export type GetFileManagerFolderApiResponse = FileManagerItem[];
export type GetFileManagerFolderApiArg = string; // folderId

export type UpdateFileManagerFolderApiResponse = unknown;
export type UpdateFileManagerFolderApiArg = {
  /** folder id */
  folderId: string;
  fileManagerItem: FileManagerItem;
};

export type DeleteFileManagerFolderApiResponse = unknown;
export type DeleteFileManagerFolderApiArg = string; // folderId

export type UploadFileApiResponse = FileManagerItem;
export type UploadFileApiArg = {
  file: File;
  folderId: string;
  createdBy: string;
  folderName: string;
};

export type FileManagerPath = {
  name: string;
  id: string;
};

export type FileManagerItem = {
  id: string;
  folderId?: string;
  name: string;
  createdBy: string;
  createdAt: string;
  modifiedAt: string;
  size: string;
  type: string;
  contents: string;
  description: string;
};

export const {
  useGetFileManagerAllFolderItemsQuery,
  useGetFileManagerAllFilesItemsQuery,
  useGetFileManagerAllItemsQuery,
  useGetFileManagerFolderQuery,
  useUpdateFileManagerFolderMutation,
  useDeleteFileManagerFolderMutation,
  useUploadFileMutation,
  useCreateFolderMutation
} = FileManagerApi;
