export interface FileWithStatus {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
}

export interface FileDropzoneProps {
  /** Callback when files change */
  onFilesChange: (files: FileWithStatus[]) => void;
  /** Current files with status */
  files: FileWithStatus[];
  /** Accept attribute for file input (e.g., ".pdf,.doc,.docx") */
  accept?: string;
  /** Array of accepted file extensions without dot (e.g., ["pdf", "doc", "docx"]) */
  acceptedFileTypes?: string[];
  /** Maximum file size in MB per file */
  maxSize?: number;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Show the file list below the dropzone */
  showFileList?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

/** Helper to create a FileWithStatus from a File */
export function createFileWithStatus(file: File): FileWithStatus {
  return {
    file,
    id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    progress: 0,
    status: "pending",
  };
}
