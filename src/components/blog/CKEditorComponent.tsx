import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { adminUploadImage } from "@/services/blogService";

const FULL_TOOLBAR = [
  "heading",
  "|",
  "bold",
  "italic",
  "link",
  "bulletedList",
  "numberedList",
  "|",
  "outdent",
  "indent",
  "|",
  "imageUpload",
  "blockQuote",
  "insertTable",
  "undo",
  "redo",
];

/** Trimmed toolbar for single-field rich text (title, subtitle, excerpt,
 * author byline) — no image/table upload, but keeps heading/lists/blockquote
 * per spec. */
export const COMPACT_TOOLBAR = [
  "heading",
  "|",
  "bold",
  "italic",
  "link",
  "bulletedList",
  "numberedList",
  "|",
  "blockQuote",
  "|",
  "undo",
  "redo",
];

interface CKEditorComponentProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
  toolbar?: string[];
}

class S3UploadAdapter {
  loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(
      (file: File) =>
        new Promise((resolve, reject) => {
          adminUploadImage(file)
            .then((url) => {
              resolve({ default: url });
            })
            .catch((err) => {
              reject(err?.message || "Upload failed");
            });
        })
    );
  }

  abort() {}
}

function S3UploadAdapterPlugin(editor: any) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
    return new S3UploadAdapter(loader);
  };
}

export function CKEditorComponent({ value, onChange, placeholder, toolbar }: CKEditorComponentProps) {
  return (
    <div className="ckeditor-wrapper rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          extraPlugins: [S3UploadAdapterPlugin],
          placeholder: placeholder || "Write content here...",
          toolbar: toolbar || FULL_TOOLBAR,
        }}
        onChange={(_event: any, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
}
