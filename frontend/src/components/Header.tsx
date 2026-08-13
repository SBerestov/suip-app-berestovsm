import React from "react";

interface HeaderProps {
  toggleMenu: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  toggleMenu,
  searchQuery,
  setSearchQuery,
}) => {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    setSearchQuery((formData.get("search") as string) || "");
  };

  const clearSearch = () => setSearchQuery("");

  return (
    <header className="flex items-center justify-between mb-8 lg:mb-20 gap-4">
      {/* Меню */}
      <div className="lg:hidden cursor-pointer" onClick={toggleMenu}>
        <img src="/images/menu.svg" width={24} height={24} />
      </div>

      {/* Логотип и название */}
      <div className="flex items-center gap-1 lg:gap-4">
        <img
          src="/images/logo.svg"
          className="max-lg:h-6 max-lg:w-auto"
          width={52}
          height={52}
        />
        <div>
          <h1 className="text-2xl lg:text-[2.375rem] font-bold leading-none">
            СУиП
          </h1>
          <span className="hidden lg:inline-block text-sm text-gray-600">
            Система управления и планирования
          </span>
        </div>
      </div>

      {/* Поиск */}
      <form
        className="hidden lg:flex items-center gap-2 w-2/5 max-lg:w-full"
        id="desktopSrch"
        method="GET"
        onSubmit={handleSearch}
      >
        <div className="flex items-center relative w-full">
          <img
            className="absolute left-3"
            src="/images/search-gray.svg"
            height={20}
            width={20}
          />
          <input
            className="bg-gray-200 border-0 rounded-xl text-black text-base px-5 py-2.5 pl-11 w-full max-h-9.5"
            type="text"
            name="search"
            id="searchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти"
          />
          <img
            className="cursor-pointer absolute right-3"
            id="clearSearch"
            src="/images/close.svg"
            onClick={clearSearch}
            height={16}
            width={16}
          />
        </div>
        <button
          className="bg-gray-200 box-border border-0 rounded-xl px-3.5 py-0.5 h-9.5 flex cursor-pointer transition-all duration-100 ease-in-out active:translate-y-0.5 max-lg:hidden"
          type="button"
        >
          <img src="/images/barcode-gray.svg" height={32} width={32} />
        </button>
      </form>

      {/* Профиль и уведомления */}
      <div className="flex self-center gap-2">
        <button className="hidden lg:flex items-center gap-2 bg-black text-white rounded-xl px-5 py-2.5 hover:bg-gray-800 transition-all duration-100 ease-in-out active:translate-y-0.5">
          <img src="/images/user-white.svg" height={24} width={24} />
          <span className="text-lg font-semibold text-white max-lg:hidden">Профиль</span>
        </button>
        <button className="hidden lg:flex items-center gap-2 bg-black text-white rounded-xl px-5 py-2.5 hover:bg-gray-800 transition-all duration-100 ease-in-out active:translate-y-0.5">
          <img src="/images/bell-white.svg" height={24} width={24} />
        </button>
        <img
          className="lg:hidden"
          src="/images/user-line.svg"
          height={24}
          width={24}
        />
      </div>
    </header>
  );
};
