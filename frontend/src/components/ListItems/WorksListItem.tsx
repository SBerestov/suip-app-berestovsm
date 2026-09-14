import React, { useCallback } from "react";
import type { WorksItem } from "../../types";
import { StatusBadge } from "./StatusBadge";
import { useHorizontalScroll } from "../../hooks/useHorizontalScroll";
import { ViewItemModal } from "../Modals/ViewItemModal";

interface WorksItemProps {
  data: WorksItem;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, data: any) => Promise<void>;
  onChange?: () => void;
}

export const WorksListItem: React.FC<WorksItemProps> = ({
  data,
  onDelete,
  onUpdate,
  onChange,
}) => {
  const imagePath = data.IMAGE_PATH ? data.IMAGE_PATH.split(",") : [];
  const imageUrl =
    imagePath.length > 0 ? `/api/${imagePath[0]}` : "/images/krisa.webp";

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { scrollLeft, hasMoved } = useHorizontalScroll();

  const handleClick = useCallback(() => {
    if (!hasMoved.current) {
      setIsModalOpen(true);
    } else {
      hasMoved.current = false;
    }
  }, [hasMoved]);

  return (
    <>
      <li
        className="flex items-center min-w-0 bg-white rounded-xl box-border gap-2 p-2 cursor-pointer lg:gap-3 lg:px-4 lg:py-1.25 "
        onClick={handleClick}
      >
        <img
          src={imageUrl}
          className="object-cover rounded-xl px-0 py-1.25 h-15 w-15 lg:h-22.5 lg:w-22.5"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div
            ref={scrollLeft}
            className="item-data grid auto-cols-auto cursor-grab gap-x-2 gap-y-1 overflow-x pb-2.5 mb-[-10px] [scrollbar-width:none] transition-[overflow-x] duration-300 ease-in-out relative select-none overflow-hidden lg:pb-2 lg:mb-[-8px]"
          >
            <div className="flex gap-2 whitespace-nowrap order-1">
              <strong className="text-[18px] sticky left-0 lg:text-2xl">
                {data.DESCRIPTION}
              </strong>
            </div>
            <div className="flex gap-1.75 text-sm whitespace-nowrap order-3 lg:text-base">
              <span className="bg-black text-white rounded-xl px-3 py-0.75 text-sm font-bold lg:text-base">
                {data.OS}
              </span>
              <span className="bg-gray-200 text-gray-700 rounded-xl px-3 py-0.75 text-sm font-bold lg:text-base">
                {data.PLANNED_DATE}
              </span>
              <span className="bg-[#E7EEFF] text-[#1B4FD8] rounded-xl px-3 py-0.75 text-sm font-bold lg:text-base">
                Материалы: {data.MATERIALS_COUNT}
              </span>
              <StatusBadge status={data.STATUS} />
            </div>
          </div>
        </div>
        <img
          src="/images/alt-arrow-right.svg"
          loading="lazy"
          height={24}
          width={24}
        />
      </li>

      {isModalOpen && (
        <ViewItemModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            onChange?.();
          }}
          data={data}
          tableType="works"
          onDelete={onDelete}
          onUpdate={onUpdate}
          title="Детали записи"
        />
      )}
    </>
  );
};
