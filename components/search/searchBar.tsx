"use client";

import { Search } from "lucide-react";
import { Input } from "../ui/input";

export default function SearchBar() {
  // ✅ Bas UI hai, koi functionality nahi
  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search..."
          className="pl-9 rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-purple-500"
          // ✅ No onChange, No onSubmit - Bas dummy
        />
      </div>
    </div>
  );
}