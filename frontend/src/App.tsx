import React from "react";
import { Header } from "./components/Header";
import { NavigationMenu } from "./components/NavigationMenu";
import { TableContainer } from "./components/TableContainer";
import {
  MaterialsListItem,
  OsListItem,
  WorksListItem,
  EquipmentListItem,
} from "./components/ListItems/index";
import { useTableData } from "./hooks/useTableData";
import type { TableType } from "./types";
import { useDebounce } from "./hooks/useDebounce";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";
import { Notification } from "./components/Notification";

function AppContent() {
  const { showNotification } = useNotifications();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeTable, setActiveTable] = React.useState<TableType>("materials");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { data, loading, error } = useTableData(
    activeTable,
    debouncedSearchQuery,
    refreshTrigger
  );

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
    showNotification(activeTable, 'success');
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      const response = await fetch(`/api/delete/${activeTable}/${id}`, {
        method: "DELETE",
      });

      console.log('DELETE Response status:', response.status, response.statusText);

      if (response.status === 200) {
        try {
          const result = await response.json();
          if (result.success) {
            refreshData();
            showNotification(activeTable, 'delete');
            return;
          }
        } catch {
          refreshData();
          showNotification(activeTable, 'delete');
          return;
        }
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Ошибка при удалении записи: ${response.status}`);

    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateEntry = async (id: number, updatedData: any) => {
    const formData = new FormData();

    Object.keys(updatedData).forEach(key => {
      if (updatedData[key] !== undefined && updatedData[key] !== null) {
        formData.append(key, updatedData[key].toString());
      }
    });

    const response = await fetch(`/api/update/${activeTable}/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Ошибка при обновлении записи");
    }

    const result = await response.json();
    refreshData();
    showNotification(activeTable, 'update');

    return result;
  };

  const renderListItems = () => {
    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!data || data.length === 0) return <div>Ничего не найдено</div>;

    switch (activeTable) {
      case "os":
        return data.map((item) => (
          <OsListItem
            key={item.ID}
            data={item}
            onDelete={handleDeleteEntry}
            onUpdate={handleUpdateEntry}
          />
        ));
      case "works":
        return data.map((item) => (
          <WorksListItem
            key={item.ID}
            data={item}
            onDelete={handleDeleteEntry}
            onUpdate={handleUpdateEntry}
          />
        ));
      case "materials":
        return data.map((item) => (
          <MaterialsListItem
            key={item.ID}
            data={item}
            onDelete={handleDeleteEntry}
            onUpdate={handleUpdateEntry}
          />
        ));
      case "equipment":
        return data.map((item) => (
          <EquipmentListItem
            key={item.ID}
            data={item}
            onDelete={handleDeleteEntry}
            onUpdate={handleUpdateEntry}
          />
        ));
      default:
        return null;
    }
  };

  return (
    <>
      <Header
        toggleMenu={() => setIsMenuOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

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
          {renderListItems()}
        </TableContainer>
      </div>

      <Notification />
    </>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;
