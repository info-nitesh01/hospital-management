"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Validate base64 data URL format
function validateBase64DataUrl(dataUrl: string): string | null {
  if (!dataUrl) {
    return "Invalid document: No file data found";
  }

  if (!dataUrl.startsWith("data:")) {
    return null; // Not a data URL, let react-pdf handle it
  }

  const base64 = dataUrl.split(",")[1];
  if (!base64) {
    return "Invalid document: No file data found";
  }

  // Try to decode a small portion to validate the base64
  try {
    atob(base64.slice(0, 100));
  } catch {
    return "Invalid document: File data is corrupted or incomplete";
  }

  return null;
}

export interface Position {
  x: number;
  y: number;
}

export interface PdfViewerProps {
  /** Base64 data URL or file URL */
  file: string;
  /** Callback when page size is determined */
  onPageSizeChange?: (size: { width: number; height: number }) => void;
  /** Callback when a field is dropped on a page */
  onFieldDrop?: (fieldType: string, position: Position, pageNumber: number) => void;
  /** Callback when number of pages is determined */
  onNumPagesChange?: (numPages: number) => void;
  /** Render custom overlay content for each page */
  renderFieldsForPage?: (pageNumber: number) => React.ReactNode;
  /** Custom class name for the container */
  className?: string;
  /** Maximum height of the viewer */
  maxHeight?: string;
  /** Width for PDF pages (e.g., "100%" for responsive) */
  pageWidth?: number;
}

export function PdfViewer({
  file,
  onPageSizeChange,
  onFieldDrop,
  onNumPagesChange,
  renderFieldsForPage,
  className,
  maxHeight = "70dvh",
  pageWidth,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [isDragOver, setIsDragOver] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);

  // Auto-detect mobile/tablet and measure container width for responsive PDF
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    const updateContainerWidth = () => {
      if (containerRef.current) {
        // Subtract padding (32px = 16px * 2 for p-4)
        const width = containerRef.current.offsetWidth - 32;
        setContainerWidth(width > 0 ? width : undefined);
      }
    };

    checkMobile();
    updateContainerWidth();

    window.addEventListener("resize", checkMobile);
    window.addEventListener("resize", updateContainerWidth);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("resize", updateContainerWidth);
    };
  }, []);

  // Determine effective page width: use prop if provided, otherwise auto-calculate on mobile
  const effectivePageWidth = pageWidth ?? (isMobile ? containerWidth : undefined);

  // Validate file data
  const validationError = useMemo(() => {
    return validateBase64DataUrl(file);
  }, [file]);

  const handleLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setLoadError(null);
      onNumPagesChange?.(numPages);
    },
    [onNumPagesChange]
  );

  const handleLoadError = useCallback((error: Error) => {
    setLoadError(error.message || "Failed to load PDF");
  }, []);

  const handlePageLoadSuccess = useCallback(
    (page: { width: number; height: number }) => {
      setPageSize({ width: page.width, height: page.height });
      onPageSizeChange?.({ width: page.width, height: page.height });
    },
    [onPageSizeChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent, pageNumber: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(pageNumber);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, pageNumber: number) => {
      e.preventDefault();
      setIsDragOver(null);

      const fieldType = e.dataTransfer.getData("fieldType");
      const pageRef = pageRefs.current.get(pageNumber);
      if (!fieldType || !onFieldDrop || !pageRef) return;

      const rect = pageRef.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert to percentage
      const percentX = (x / pageSize.width) * 100;
      const percentY = (y / pageSize.height) * 100;

      // Clamp to valid range
      const clampedX = Math.max(0, Math.min(percentX, 100));
      const clampedY = Math.max(0, Math.min(percentY, 100));

      onFieldDrop(fieldType, { x: clampedX, y: clampedY }, pageNumber);
    },
    [onFieldDrop, pageSize.width, pageSize.height]
  );

  const setPageRef = (pageNumber: number, ref: HTMLDivElement | null) => {
    if (ref) {
      pageRefs.current.set(pageNumber, ref);
    } else {
      pageRefs.current.delete(pageNumber);
    }
  };

  // Show error UI if base64 validation failed
  if (validationError) {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <div
          className="border rounded-lg shadow-sm overflow-auto w-full"
          style={{ maxHeight }}
        >
          <div className="p-8 text-center text-destructive">
            <p>Failed to load PDF</p>
            <p className="text-xs text-muted-foreground mt-2">
              {validationError}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* PDF Document - Scrollable */}
      <div
        ref={containerRef}
        className="border rounded-lg shadow-sm overflow-auto w-full"
        style={{ maxHeight }}
      >
        <Document
          file={file}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={
            <div className="p-8">
              <Skeleton className="h-[800px] w-[600px]" />
            </div>
          }
          error={
            <div className="p-8 text-center text-destructive">
              <p>Failed to load PDF</p>
              {loadError && (
                <p className="text-xs text-muted-foreground mt-2">{loadError}</p>
              )}
            </div>
          }
        >
          <div className="flex flex-col items-center gap-4 p-4">
            {Array.from({ length: numPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <div key={pageNumber} className="relative">
                  {/* Page number indicator */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded z-10">
                    Page {pageNumber}
                  </div>
                  <div
                    ref={(ref) => setPageRef(pageNumber, ref)}
                    data-page-number={pageNumber}
                    className={cn(
                      "relative transition-colors border rounded",
                      isDragOver === pageNumber && "ring-2 ring-primary ring-inset bg-primary/5"
                    )}
                    style={{
                      width: pageSize.width || "auto",
                      height: pageSize.height || "auto",
                    }}
                    onDragOver={(e) => handleDragOver(e, pageNumber)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, pageNumber)}
                  >
                    <Page
                      pageNumber={pageNumber}
                      onLoadSuccess={pageNumber === 1 ? handlePageLoadSuccess : undefined}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={effectivePageWidth}
                    />
                    {/* Overlay for signature fields */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="pointer-events-auto">
                        {renderFieldsForPage ? renderFieldsForPage(pageNumber) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Document>
      </div>
    </div>
  );
}
