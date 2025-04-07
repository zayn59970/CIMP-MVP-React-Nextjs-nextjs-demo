// import { useParams } from 'next/navigation'; 
// import { useEffect, useMemo, useState } from 'react';
// import _ from 'lodash';
// import { useAppSelector } from 'src/store/hooks';
// import {
// 	FileManagerItem,
// 	FileManagerPath,
// 	useGetFileManagerAllFolderItemsQuery,
// 	useGetFileManagerFolderQuery,
// 	useGetFileManagerAllFilesItemsQuery,
// 	useGetFileManagerAllItemsQuery,
// } from '../FileManagerApi';
// import { selectSelectedItemId } from '../fileManagerAppSlice';

// function useFileManagerData() {
// 	const routeParams = useParams();
// 	const folderId = routeParams?.folderId?.[0] ?? 'root';

// 	const [folderData, setFolderData] = useState<FileManagerItem[]>([]);
// 	const [folderItems, setFolderItems] = useState<FileManagerItem[]>([]);
// 	const [isLoading, setIsLoading] = useState(true);
// 	const [filesNumber, setFilesNumber] = useState(0);
// 	const [allFiles, setAllFiles] = useState<FileManagerItem[]>([]);
// 	useEffect(() => {
// 	  const fetchData = async () => {
// 		setIsLoading(true);
	
// 		try {
// 		  const folderResponse = await useGetFileManagerFolderQuery(folderId);
// 		  const allItemsResponse = await useGetFileManagerAllFolderItemsQuery();
// 		  const allFilesResponse = await useGetFileManagerAllFilesItemsQuery();
// 		  const allFilesItemsResponse = await useGetFileManagerAllItemsQuery();
// 		  setAllFiles(allFilesItemsResponse?.data || []);
// 		  setFilesNumber(allFilesResponse?.data?.length || 0);
// 		  setFolderData(folderResponse?.data || []);
// 		  setFolderItems(allItemsResponse?.data || []);
// 		} catch (error) {
// 		  console.error("Error fetching file manager data:", error);
// 		} finally {
// 		  setIsLoading(false);
// 		}
// 	  };
	
// 	  fetchData();
// 	}, [folderId]);
// 	// ✅ Compute folders and files correctly
// 	const folders = useMemo(() => _.filter(folderItems, { type: 'folder' }), [folderItems]);
// 	const files = useMemo(() => _.reject(folderData, { type: 'folder' }), [folderItems]);

// 	// ✅ Compute the path correctly
// 	const path = useMemo(() => {
// 		const path: FileManagerPath[] = [];
// 		let currentFolder: FileManagerItem | null = _.find(folderItems, { id: folderId }) || null;

// 		while (currentFolder) {
// 			path.unshift({ id: currentFolder.id, name: currentFolder.name });
// 			currentFolder = folderItems.find((item) => item.id === currentFolder.folderId) || null;
// 		}

// 		return path;
// 	}, [folderItems, folderId]);

// 	// ✅ Get the selected item correctly
// 	const selectedItemId = useAppSelector(selectSelectedItemId);
// 	const selectedItem = useMemo(() => _.find(allFiles, { id: selectedItemId }), [allFiles, selectedItemId]);
// 	return {
// 		folders,
// 		files,
// 		filesNumber,
// 		isLoading,
// 		selectedItem,
// 		selectedItemId,
// 		path,
// 	};
// }

// export default useFileManagerData;

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { useAppSelector } from 'src/store/hooks';
import {
	FileManagerItem,
	FileManagerPath,
} from '../FileManagerApi';
import { selectSelectedItemId } from '../fileManagerAppSlice';
import { supabaseClient } from '@/utils/supabaseClient';

function useFileManagerData() {
	const routeParams = useParams();
	const folderId = routeParams?.folderId?.[0] ?? 'root';

	const [folderData, setFolderData] = useState<FileManagerItem[]>([]);
	const [folderItems, setFolderItems] = useState<FileManagerItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [filesNumber, setFilesNumber] = useState(0);
	const [allFiles, setAllFiles] = useState<FileManagerItem[]>([]);

	const fetchData = async () => {
		setIsLoading(true);
		try {
			// Fetching Folder Data
			const { data: folderResponse, error: folderError } = await supabaseClient
				.from("file_manager_item")
				.select("*")
				.eq("folderId", folderId);

			// Fetching All Folders
			const { data: allFoldersResponse, error: foldersError } = await supabaseClient
				.from("file_manager_item")
				.select("*")
				.eq("type", "folder");

			// Fetching All Files
			const { data: allFilesResponse, error: filesError } = await supabaseClient
				.from("file_manager_item")
				.select("*")
				.neq("type", "folder");

			// Fetching All Items
			const { data: allItemsResponse, error: itemsError } = await supabaseClient
				.from("file_manager_item")
				.select("*");

			if (folderError || foldersError || filesError || itemsError) {
				console.error("Error fetching file manager data:", folderError || foldersError || filesError || itemsError);
			} else {
				setFolderData(folderResponse || []);
				setFolderItems(allFoldersResponse || []);
				setAllFiles(allItemsResponse || []);
				setFilesNumber(allFilesResponse?.length || 0);
			}
		} catch (error) {
			console.error("Unexpected error fetching file manager data:", error);
		} finally {
			setIsLoading(false);
		}
	};
	// ✅ Get the selected item correctly
	const selectedItemId = useAppSelector(selectSelectedItemId);
	const selectedItem = useMemo(() => _.find(allFiles, { id: selectedItemId }), [allFiles, selectedItemId]);

	useEffect(() => {
		fetchData();

		// Real-time subscription
		const subscription = supabaseClient
			.channel("file_manager_item")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "file_manager_item" },
				() => {
					fetchData(); // Refetch data on any change
				}
			)
			.subscribe();

		return () => {
			supabaseClient.removeChannel(subscription);
		};
	}, [selectedItemId, folderId]);

	// ✅ Compute folders and files correctly
	const folders = useMemo(() => _.filter(folderItems, { type: 'folder' }), [folderItems]);
	const files = useMemo(() => _.reject(folderData, { type: 'folder' }), [folderData]);

	// ✅ Compute the path correctly
	const path = useMemo(() => {
		const path: FileManagerPath[] = [];
		let currentFolder: FileManagerItem | null = _.find(folderItems, { id: folderId }) || null;

		while (currentFolder) {
			path.unshift({ id: currentFolder.id, name: currentFolder.name });
			currentFolder = folderItems.find((item) => item.id === currentFolder.folderId) || null;
		}

		return path;
	}, [folderItems, folderId]);
const refetch = async () => {fetchData()}

	return {
		folders,
		files,
		filesNumber,
		isLoading,
		selectedItem,
		selectedItemId,
		path,
		refetch,
	};
}

export default useFileManagerData;
