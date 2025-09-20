import React from "react";

const ButtonGradient = ({ name }) => {
  return (
    <button className="btn relative flex cursor-pointer items-center justify-center overflow-hidden rounded-[100px] border-none p-[2.5px]" >
      <span className="btnSpan relative z-[1] w-full rounded-[100px]  [background-color:hsl(60,100%,85%)] p-4 py-1 text-black text-sm font-medium  backdrop-blur-[40px] hover:bg-primary hover:text-white">
        {name}
      </span>
    </button>
  );
};

export default ButtonGradient;
