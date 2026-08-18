import React from "react";
import { FloatingButton } from "./FloatingButton";
import { AddEntryWizard } from "./Modals/AddEntryWizard";

interface TableContainerProps {
  title: string;
  children: React.ReactNode;
  searchQuery: string;
  onSearch: (query: string) => void;
  onAddEntry: (data: any) => Promise<void>;
  tableType: string;
}

const tableTranslated = {
  materials: "материалов",
  os: "ОС",
  equipment: "оборудования",
  works: "работ"
};

export const TableContainer: React.FC<TableContainerProps> = ({
  title,
  children,
  searchQuery,
  onSearch,
  onAddEntry,
  tableType,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSearch((formData.get("search") as string) || "");
  };

  const clearSearch = () => {
    onSearch("");
  };

  const translatedTitle = tableTranslated[tableType as keyof typeof tableTranslated] || title;

  const testConnection = async () => {
    try {
      const response = await fetch('/api/test');
      const result = await response.json();
      console.log('Test result:', result);
    } catch (error) {
      console.error('Test error:', error);
    }
  }

  return (
    <section className="flex-grow lg:ml-[10%]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl lg:text-[2.375rem] font-bold">Список {translatedTitle}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="hidden lg:flex items-center gap-2 bg-gray-200 rounded-xl px-4 py-2 font-bold hover:bg-gray-300 transition-all duration-100 ease-in-out active:translate-y-0.5"
          >
            <span className="text-[20px]">+</span>
            Добавить
          </button>
          <button onClick={() => testConnection()} className="flex items-center gap-2 bg-gray-200 rounded-xl px-3.5 py-1.5 font-bold hover:bg-gray-300 transition-all duration-100 ease-in-out active:translate-y-0.5">
            <img src="/images/calendar.svg" height={24} width={24}></img>
            <span>Дата</span>
          </button>
        </div>
      </div>

      {/* Мобильный поиск */}
      <form
        className="flex w-full mb-4 lg:hidden"
        id="mobileSrch"
        method="GET"
        onSubmit={handleMobileSearch}
      >
        <div className="flex items-center relative w-full">
          <img
            className="absolute left-3 pointer-events-none"
            src="/images/search-gray.svg"
            height={20}
            width={20}
          />
          <input
            className="bg-gray-200 rounded-xl text-black text-base px-5 py-2.5 pl-11 max-h-9.5 w-full"
            type="text"
            placeholder="Найти"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
          <img
            className="cursor-pointer absolute right-3"
            src="/images/close.svg"
            onClick={clearSearch}
            height={16}
            width={16}
          />
        </div>
      </form>

      {/* Список элементов */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:grid-cols-[repeat(auto-fill,minmax(600px,1fr))] lg:gap-3">
        {children}
      </ul>

      <FloatingButton onClick={() => setIsAddModalOpen(true)} />

      <AddEntryWizard
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tableType={tableType}
        onAddEntry={onAddEntry}
      />
    </section>
  );
};
