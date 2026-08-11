import React from 'react';
import type { EquipmentItem } from '../../types';

interface EquipmentItemProps {
  data: EquipmentItem;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, data: any) => Promise<void>;
}

export const EquipmentListItem: React.FC<EquipmentItemProps> = ({ data }) => {
  const imageUrl = data.IMAGE_PATH 
    ? `/api/${data.IMAGE_PATH}`
    : '/public/images/krisa.webp';

  return (
    <li className="flex items-center min-w-0 bg-white rounded-xl box-border gap-2 p-2 cursor-pointer lg:gap-3 lg:px-4 lg:py-1.25 ">
      <img src={imageUrl} className="object-cover rounded-xl px-0 py-1.25 h-15 w-15 lg:h-22.5 lg:w-22.5" loading="lazy" />
      <div className="flex-1 min-w-0">
        <div className="grid overflow-x pb-2.5 mb-[-10px] [scrollbar-width:none] transition-[overflow-x] duration-300 ease-in-out relative select-none lg:overflow-hidden lg:pb-2 lg:mb-[-8px]">
          <div className="flex gap-2 whitespace-nowrap">
            <strong className="text-[18px] sticky left-0 lg:text-2xl">
              {data.MODEL}
            </strong>
          </div>
          <div className="flex gap-2 text-sm whitespace-nowrap lg:text-base">
            <span className="bg-black text-white rounded-xl px-3 py-0.75 text-sm font-bold lg:text-base">
              {data.ID}
            </span>
            <span className="bg-gray-200 text-gray-700 rounded-xl px-3 py-0.75 text-sm font-bold lg:text-base">
              {data.MODEL_SERIES}
            </span>
          </div>
        </div>
      </div>
      <img src="/images/alt-arrow-right.svg" loading="lazy" height={24} width={24} />
    </li>
  );
};