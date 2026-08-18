import React from "react";
import { Portal } from "../Portal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  customClass?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  customClass,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <>
        <div
          className="fixed inset-0 bg-black opacity-50 z-[999]"
          onClick={onClose}
        />

        <div
          className={`fixed flex flex-col max-h-[90%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-xl z-[1000] ${customClass}`}
        >
          <div className="flex justify-between items-center mb-7 gap-2 flex-shrink-0">
            <h2 className="text-[28px] font-bold leading-none">{title}</h2>
            <button className="cursor-pointer" onClick={onClose}>
              <img src="/images/close.svg" height={24} width={24} />
            </button>
          </div>
          {children}
        </div>
      </>
    </Portal>
  );
};
