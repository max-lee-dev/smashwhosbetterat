import React from "react";
import {GrGithub} from "react-icons/gr";

export const Footer = () => {
  return (
    <div
      className={"flex-col text-sm text-gray-400 font-mono px-4 mt-20 self-end flex justify-center items-center w-full"}>
      <a href={"https://github.com/max-lee-dev/smashwhosbetterat"} className="flex items-center">
        <GrGithub className="text-black text-4xl"/>


      </a>
      <p className="pt-2 text-center">by <a href={"https://youtube.com/@Spenkr"}
                                            className={"text-blue-500"}>Spenkr</a>&apos;s</p>
      <p>
        lil bro &gt;:)</p>
    </div>
  );
};

export default Footer;