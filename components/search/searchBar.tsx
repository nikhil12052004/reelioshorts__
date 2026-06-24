"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";

// ✅ SearchResult Type Define Karo
type SearchResult = {
  id: string;
  title: string;
  user: {
    name: string;
  };
  videoUrl: string;
};

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Search with debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search by title..."
          className="pl-9 pr-9 rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-purple-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-popover rounded-xl shadow-2xl border border-border overflow-hidden z-50">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <>
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => {
                    router.push(`/?video=${result.id}`);
                    setShowResults(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="w-12 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    <video
                      src={result.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.user.name}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* View All */}
              <div
                onClick={() => {
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                  setShowResults(false);
                }}
                className="p-2 text-center text-xs text-purple-500 hover:bg-accent cursor-pointer border-t border-border"
              >
                View all results
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}