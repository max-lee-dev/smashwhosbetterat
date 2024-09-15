import React from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import smashball from "@/app/public/smashball.png";

export const Navbar = () => {
  const router = useRouter();
  return (
    <div className={"nav mt-1 px-4 self-start flex justify-between items-center w-full"}>
      <div className={'flex'}>
        <a onClick={() => {
          router.push("/")
        }} className="cursor-pointer flex items-center mr-10">
          <div className="mr-4 text-blue-500">
            <Image
              src={smashball}
              alt="avatar"
              width={40}
            />
          </div>
          <span className="font-mono text-3xl text-black font-bold">WhosBetterAt</span>
        </a>

      </div>
      <div className={'flex'}>
        <a onClick={() => {
          router.push("/")
        }} className="cursor-pointer flex items-center mr-12">
          <span className="text-blue-600 px-4 py-1.5 font-bold rounded-md border-blue-600 border-2">Home</span>
        </a>
        <button
          className="px-4 self-end w-fit py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => router.push('/rankings')}
        >
          <text className={"font-bold"}>View rankings</text>
        </button>
      </div>

    </div>
  );
};

export default Navbar;