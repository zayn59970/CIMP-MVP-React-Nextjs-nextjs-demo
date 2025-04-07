import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { supabaseClient } from "@/utils/supabaseClient";

// Set up Supabase client

// Image upload function
async function uploadImageToSupabase(file: File) {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabaseClient.storage
    .from('course-images')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  // Get the public URL for the uploaded image
  const publicURL = supabaseClient.storage.from('course-images').getPublicUrl(fileName).data.publicUrl;
  return publicURL;
}

const Editor = ({ onSave }: { onSave: (html: string) => void }) => {
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        // Configure Tiptap's image extension
        inline: true,
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
    ],
    content: '', // Initial content
    onUpdate: ({ editor }) => {
      onSave(editor.getHTML());
    },
    // Custom image upload handling
    onDrop: async (event: DragEvent) => {
      const files = event.dataTransfer?.files;
      if (files?.length) {
        setLoading(true);
        const file = files[0];
        const url = await uploadImageToSupabase(file);
        setLoading(false);

        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }
    },
  });

  return (
    <div>
      <div>
        <EditorContent editor={editor} />
      </div>
      <button
        onClick={() => onSave(editor?.getHTML() || '')}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Save Content
      </button>
      {loading && <p>Uploading image...</p>}
    </div>
  );
};

export default Editor;
