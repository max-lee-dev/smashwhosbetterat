import React from "react";
import {useRouter} from "next/navigation";
import {GrGithub} from "react-icons/gr";
import Image from "next/image";
import smashball from "@/app/public/smashball.png";

export const Footer = () => {
  const router = useRouter();
  return (
    <div className={"nav px-4 self-start flex justify-center items-center w-full"}>
      <div onClick={() => {
        router.push('/')
      }}>
        <Image
          src={smashball}
          alt="avatar"
          width={40}
        />
        <span className="font-mono text-3xl text-black font-bold">WhosBetterAt</span>
      </div>
      <a href={"www.github.com"} className="flex items-center">
        <GrGithub className="text-3xl"/>
      </a>


    </div>
  );
};

export default Footer;