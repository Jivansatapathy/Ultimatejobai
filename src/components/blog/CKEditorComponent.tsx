import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { adminUploadImage } from "@/services/blogService";

interface CKEditorComponentProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
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

export function CKEditorComponent({ value, onChange, placeholder }: CKEditorComponentProps) {
  return (
    <div className="ckeditor-wrapper rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          extraPlugins: [S3UploadAdapterPlugin],
          placeholder: placeholder || "Write content here...",
          toolbar: [
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
          ],
        }}
        onChange={(_event: any, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
}
