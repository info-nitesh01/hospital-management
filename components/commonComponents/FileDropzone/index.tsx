"use client";

import * as React from "react";
import { useCallback, useState, useRef } from "react";
import { HiOutlineCloudArrowUp, HiXMark, HiCheck } from "react-icons/hi2";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import type { FileDropzoneProps } from "./types";
import { createFileWithStatus } from "./types";

export type { FileDropzoneProps, FileWithStatus } from "./types";
export { createFileWithStatus } from "./types";

export function FileDropzone({
  onFilesChange,
  files,
  accept = ".pdf,.doc,.docx",
  acceptedFileTypes = ["pdf", "doc", "docx"],
  maxSize = 50,
  maxFiles = 10,
  multiple = true,
  showFileList = true,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      const ext = file.name.toLowerCase().split(".").pop() || "";
      if (!acceptedFileTypes.includes(ext)) {
        setError(`Only ${acceptedFileTypes.join(", ").toUpperCase()} files are allowed`);
        return false;
      }

      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`);
        return false;
      }

      return true;
    },
    [acceptedFileTypes, maxSize]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(validateFile);

      if (validFiles.length > 0) {
        const newFiles = validFiles.map(createFileWithStatus);
        const combined = [...files, ...newFiles].slice(0, maxFiles);

        if (droppedFiles.length + files.length > maxFiles) {
          setError(`Maximum ${maxFiles} files allowed`);
        }
        onFilesChange(combined);
      }
    },
    [disabled, files, maxFiles, onFilesChange, validateFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
      const validFiles = selectedFiles.filter(validateFile);

      if (validFiles.length > 0) {
        const newFiles = validFiles.map(createFileWithStatus);
        const combined = [...files, ...newFiles].slice(0, maxFiles);

        if (selectedFiles.length + files.length > maxFiles) {
          setError(`Maximum ${maxFiles} files allowed`);
        }
        onFilesChange(combined);
      }

      // Reset input to allow selecting same file again
      e.target.value = "";
    },
    [files, maxFiles, onFilesChange, validateFile]
  );

  const handleBrowseClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleRemoveFile = useCallback(
    (id: string) => {
      onFilesChange(files.filter((f) => f.id !== id));
      setError(null);
    },
    [files, onFilesChange]
  );

  const getFileIcon = (fileName: string) => {
    const isPdf = fileName.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      return (
        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 bg-red-100">
          <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13h1c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1h-.5v1.5H8V13h.5zm3 0H13c.55 0 1 .45 1 1v3c0 .55-.45 1-1 1h-1.5V13zm3.5 0h2v1h-1.5v.5H17v1h-1.5V17H14v-4h1z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 bg-blue-100">
        <HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Drop zone - clean dashed border style */}
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed p-6 transition-all cursor-pointer bg-blue-50",
          isDragging
            ? "border-primary bg-blue-100/70"
            : "border-blue-300/50 hover:border-primary/50 hover:bg-blue-100/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 bg-muted rounded-full">
            <HiOutlineCloudArrowUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drag and drop files here, or{" "}
              <span className="text-primary hover:underline">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {acceptedFileTypes.join(", ").toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* File list */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {files.map((fileWithStatus) => (
            <div
              key={fileWithStatus.id}
              className="flex items-center gap-3 p-2 bg-muted rounded-lg shadow-sm"
            >
              {/* File type icon */}
              {getFileIcon(fileWithStatus.file.name)}

              {/* File info and progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium truncate">
                    {fileWithStatus.file.name.length > 25
                      ? fileWithStatus.file.name.substring(0, 22) + "..."
                      : fileWithStatus.file.name}
                  </span>
                  {fileWithStatus.status === "completed" && (
                    <span className="text-xs text-green-600 whitespace-nowrap flex items-center gap-1">
                      Successfully Uploaded
                      <HiCheck className="w-4 h-4" />
                    </span>
                  )}
                  {fileWithStatus.status === "error" && (
                    <span className="text-xs text-red-600 whitespace-nowrap">
                      Failed
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="mt-1 h-0.75 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      fileWithStatus.status === "completed" && "bg-green-400",
                      fileWithStatus.status === "error" && "bg-red-400",
                      fileWithStatus.status === "pending" && "bg-green-400",
                      fileWithStatus.status === "uploading" && "bg-green-400"
                    )}
                    style={{
                      width: `${fileWithStatus.status === "pending" ? 100 : fileWithStatus.progress}%`,
                    }}
                  />
                </div>
              </div>

              {/* Remove button (only when not uploading/completed) */}
              {fileWithStatus.status !== "uploading" &&
                fileWithStatus.status !== "completed" && (
                  <button
                    type="button"
                    className="p-1 rounded-full hover:bg-muted shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(fileWithStatus.id);
                    }}
                  >
                    <HiXMark className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}

              {/* Checkmark for completed */}
              {fileWithStatus.status === "completed" && (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <HiCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
