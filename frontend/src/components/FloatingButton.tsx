import React from "react";

interface FloatingButtonProps {
  onClick: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
  return (
    <>
      <button
        onClick={onClick}
        className="lg:hidden fixed bottom-5 right-5 w-15 h-15 rounded-full bg-black text-white text-[26px] flex items-center justify-center shadow-lg transition-transform active:scale-95"
      >
        +
      </button>
    </>
  );
};
