import { useState, useEffect, useRef } from "react";
import { quickSearch, type QuickSearchResult } from "@/lib/api/datatable";

// Re-export for backward compatibility
export type { QuickSearchResult };

export function useQuickSearch(
  apiUrl?: string,
  debounceMs: number = 400
) {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<QuickSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Clear results if search text is empty
    if (!searchText.trim()) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    // Debounce the search
    const timeoutId = setTimeout(async () => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);
      setIsOpen(false); // Close popover while loading

      try {
        // Use the API function
        const searchResults = await quickSearch(
          {
            quicksearch: searchText,
            roleName: "",
          },
          apiUrl,
          abortControllerRef.current.signal
        );

        setResults(searchResults);
        setIsOpen(true);
      } catch (err) {
        // Don't set error state if request was aborted
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchText, apiUrl, debounceMs]);

  const clearSearch = () => {
    setSearchText("");
    setResults([]);
    setIsOpen(false);
    setError(null);
  };

  return {
    searchText,
    setSearchText,
    results,
    isLoading,
    error,
    isOpen,
    setIsOpen,
    clearSearch,
  };
}
