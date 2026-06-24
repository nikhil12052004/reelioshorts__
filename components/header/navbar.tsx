"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, Search, X, Menu, Play } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

const Navbar = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1.5 rounded-lg">
              <Play className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-bold text-lg hidden sm:block">
              REELIO<span className="text-purple-500">shorts</span>
            </h1>
          </Link>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-4 relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title..."
              className="pl-9 pr-9 rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-purple-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/upload">
              <Button className="gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </Link>

            {isSignedIn ? (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-purple-500/20 rounded-full"
                  }
                }}
              />
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="rounded-full">
                    Sign In
                  </Button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <Button className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            )}

            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Search - Below Header */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title..."
              className="pl-9 pr-9 rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-purple-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t space-y-3">
            <Link 
              href="/upload" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Plus className="h-5 w-5 text-purple-500" />
              <span>Create Video</span>
            </Link>

            <div className="flex items-center justify-between px-3 py-2 border-t">
              <div className="flex items-center gap-3">
                <ModeToggle />
              </div>
              
              {isSignedIn ? (
                <div className="flex items-center gap-3">
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;