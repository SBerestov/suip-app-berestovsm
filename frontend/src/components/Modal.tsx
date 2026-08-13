import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className='fixed inset-0 bg-black opacity-50 z-[999]' onClick={onClose} />

      <form className='block w-[90%] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-xl z-1000 md:w-[60%] lg:w-auto'>
        <div className='flex justify-between items-center mb-7 gap-2'>
          <h2 className='text-[28px] font-bold'>{title}</h2>
          <button className='cursor-pointer' onClick={onClose}>
            <img src='/images/close.svg' height={24} width={24} />
          </button>
        </div>
        {children}
      </form>
    </>
  );
}