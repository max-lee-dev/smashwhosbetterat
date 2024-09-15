import React from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import smashball from "@/app/public/smashball.png";

export const Navbar = () => {
  const router = useRouter();
  return (
    <div className={"nav px-4 self-start flex justify-between items-center w-full"}>

      <div onClick={() => {
        router.push("/")
      }} className="flex items-center mr-12">
        <Image
          src={smashball}
          alt="avatar"
          width={40}
        />
        <span className="font-mono text-3xl text-black font-bold">WhosBetterAt</span>
      </div>
      <button
        className="px-4 self-end w-fit py-2 bg-blue-500 text-white  rounded hover:bg-blue-600 transition-colors"
        onClick={() => router.push('/rankings')}
      >
        <text className={"font-bold"}>View rankings</text>
      </button>
    </div>
  );
};

export default Navbar;