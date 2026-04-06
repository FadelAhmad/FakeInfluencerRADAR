"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (userId: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [userId, setUserId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      onSearch(userId.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-2xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Enter influencer user ID to analyze..."
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || !userId.trim()}
        className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Analyze
          </>
        )}
      </Button>
    </form>
  );
}
