"use client";

import Link from "next/link";
import { IoSettingsOutline } from "react-icons/io5";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">Reflector Journal</span>
            </Link>
          </div>
          <div className="flex items-center">
            <Link
              href="/settings"
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              title="Settings"
            >
              <IoSettingsOutline className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
