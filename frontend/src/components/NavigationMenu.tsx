import React from "react";
import type { TableType } from "../types";

interface NavigationMenuProps {
  isOpen: boolean;
  closeMenu: () => void;
  activeTable: string;
  setActiveTable: (table: TableType) => void;
}

const tables = [
  { id: "os", name: "ОС", icon: "/images/os.svg" },
  { id: "works", name: "Работы", icon: "/images/works.svg" },
  { id: "materials", name: "Материалы", icon: "/images/materials.svg" },
  { id: "equipment", name: "Оборудование", icon: "/images/equipment.svg" },
];

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  isOpen,
  closeMenu,
  activeTable,
  setActiveTable
}) => {
  const handleTableClick = (tableId: TableType) => {
    setActiveTable(tableId);
    closeMenu();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[900]"
          onClick={closeMenu}
        />
      )}

      {/* Меню */}
      <div
        className={`fixed top-0 h-full bg-white p-4 transition-transform duration-300 ease-in-out z-[1000] lg:hidden
          ${isOpen ? "-translate-x-3 shadow-lg" : "translate-x-[calc(-100%_-_12px)]"}
          lg:static lg:transform-none lg:shadow-none lg:z-auto lg:w-64
        `}
      >
        {/* Хедер навигации */}
        <div className="flex justify-between items-center mb-8 lg:hidden">
          <div className="flex items-center gap-1">
            <img
              className="h-6 w-auto lg:hidden"
              src="/images/logo.svg"
              height={24}
              width={24}
            />
            <h1 className="text-2xl font-bold leading-none m-0">СУиП</h1>
          </div>
          <button
            onClick={closeMenu}
            className="lg:hidden"
          >
            <img
              src="/images/alt-arrow-left.svg"
              alt="Закрыть"
              height={24}
              width={24}
            />
          </button>
        </div>

        {/* Навигация на мобилках */}
        <nav className="flex flex-col items-start lg:hidden">
          <span className="text-gray-500 text-xs mb-4 tracking-[0.6px] block">
            Таблицы
          </span>

          {tables.map((table) => (
            <button
              key={table.id}
              className={`flex items-center w-75 gap-3 p-2 mb-3 rounded-xl transition-colors lg:w-105
                ${activeTable === table.id
                  ? "bg-gray-100 text-shite"
                  : "hover:bg-gray-100 text-black"
                }`}
              data-table={table.id}
              onClick={() => handleTableClick(table.id as TableType)}
            >
              <img height={30} width={30} src={table.icon} />
              <span className="font-medium">{table.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Навигация на десктопах */}
      <nav className="hidden flex-col items-start lg:flex">

        {tables.map((table) => (
          <button
            key={table.id}
            className={`flex items-center gap-3 py-2 mb-5 rounded-xl transition-colors cursor-pointer hover:bg-gray-100 text-black
              ${activeTable === table.id
                ? "bg-gray-100 text-black"
                : "hover:bg-gray-100 text-black"
              }`}
            data-table={table.id}
            onClick={() => handleTableClick(table.id as TableType)}
          >
            <img height={30} width={30} src={table.icon} />
            <span className="font-medium">{table.name}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
