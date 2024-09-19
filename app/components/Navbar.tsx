import React, {useState} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import smashball from "@/app/public/smashball.png";

export const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle mobile menu

  return (
    <nav className={"nav mt-1 px-4 self-start flex justify-between items-center w-full"}>
      {/* Logo Section */}
      <div className={'flex'}>
        <a onClick={() => router.push("/")} className="cursor-pointer flex items-center mr-10">
          <div className="mr-4 text-blue-500">
            <Image src={smashball} alt="avatar" width={40}/>
          </div>
          <span className="font-mono text-2xl sm:text-3xl text-black font-bold">WhosBetterAt</span>
        </a>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-6 items-center">
        <a
          onClick={() => router.push("/")}
          className="cursor-pointer flex items-center"
        >
          <span className="text-blue-600 px-4 py-1.5 font-bold rounded-md border-blue-600 border-2">Home</span>
        </a>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => router.push("/rankings")}
        >
          <span className="font-bold">View Rankings</span>
        </button>
      </div>

      {/* Hamburger Button (for mobile) */}
      <div className="md:hidden flex items-center">
        <button
          className="text-blue-600 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {/* Icon for hamburger */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 right-4 bg-white shadow-md rounded-lg p-4 md:hidden z-10">
          <a
            onClick={() => {
              router.push("/");
              setIsMenuOpen(false); // Close menu when navigating
            }}
            className="block text-blue-600 px-4 py-2 font-bold rounded-md border-blue-600 border-2 mb-2"
          >
            Home
          </a>
          <button
            className="block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => {
              router.push("/rankings");
              setIsMenuOpen(false); // Close menu when navigating
            }}
          >
            <span className="font-bold">View Rankings</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;