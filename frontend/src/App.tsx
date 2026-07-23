import React from "react";

import { useTableData } from "./hooks/useTableData";
import type { TableType } from "./types";

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeTable, setActiveTable] = React.useState<TableType>("materials");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);


  const closeMenu = () => setIsMenuOpen(false);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddEntry = async (formData: any) => {
    const response = await fetch(`/api/add/${activeTable}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Ошибка при добавлении записи");
    }

    refreshData();
  };

  return (
    <>
      <Header/>

      <div className="flex mb-20">
        <NavigationMenu
          isOpen={isMenuOpen}
          closeMenu={closeMenu}
          activeTable={activeTable}
          setActiveTable={setActiveTable}
        />

        <TableContainer
          title={`Список ${activeTable}`}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onAddEntry={handleAddEntry}
          tableType={activeTable}
        >
        </TableContainer>
      </div>
    </>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
