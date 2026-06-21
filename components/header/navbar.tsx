"use client";

import React from "react";
import Link from "next/link";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

const Navbar = () => {
  const { isSignedIn } = useUser();
  return (
    <div className='flex items-center justify-between h-14 border-b border-gray-200'>
      {/* Logo */}
      <div>
        <h1 className='font-bold text-xl'>
          REELIO<span className='text-blue-500'>shorts</span>
        </h1>
      </div>

      {/* Search bar */}
      <div className='w-1/2'>
        <Input
          type="text"
          placeholder="Search..."
          className="rounded-md"
        />
      </div>

      {/* Account management */}
      <div className="flex items-center space-x-2">
        <Link href='/upload'>
        <Button className="flex items-center gap-2 rounded-md">
          <Plus className="h-4 w-4" />
          Create
        </Button>
        </Link>

        {isSignedIn ? (
          <UserButton />
        ) : (
          <>
            <SignInButton mode="modal">
              <Button variant="ghost" className="rounded-full">
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button className="rounded-full bg-zinc-900 hover:bg-zinc-800 text-white">
                Sign Up
              </Button>
            </SignUpButton>
          </>
        )}

        <ModeToggle />
      </div>

    </div>
  )
}

export default Navbar