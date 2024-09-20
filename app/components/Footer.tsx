import React from "react";
import {GrGithub} from "react-icons/gr";

export const Footer = () => {

  return (
    <div
      className={"flex-col text-sm text-gray-400 font-mono px-4 mt-2 self-end flex justify-center items-center w-full"}>
      <div className={"flex-col items-center flex"}>
        <a href={"https://github.com/max-lee-dev/smashwhosbetterat"} className="flex items-center">
          <GrGithub className="text-black text-4xl"/>


        </a>

        <p className="pt-2 text-center">by <a href={"https://x.com/jintuschu"}
                                              className={"text-blue-500"}>Jintus</a>&apos; and <a
          href={"https://youtube.com/@Spenkr"}
          className={"text-blue-500"}>Spenkr</a>&apos;s lil bro &gt;:)
        </p>
        <p className="text-center">created 9/19/24</p>
      </div>
      {/*<div className={"self-end"}>*/}
      {/*  <p>2021</p>*/}
      {/*</div>*/}

    </div>
  );
};

export default Footer;