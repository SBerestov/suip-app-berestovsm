import React, { createContext } from 'react';

type NotificationType = 'success' | 'delete' | 'update';

interface Notification {
  id: string;
  action: string;
  tableName: string;
  type: NotificationType;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (table: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const tableTranslated = {
  materials: "материалы",
  os: "ОС",
  equipment: "оборудование",
  works: "работы",
};

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const showNotification = (table: string, type: NotificationType) => {
    const id = Math.random().toString(36).substring(2, 9);
    const actions = {
      success: 'добавлены',
      update: 'обновлены', 
      delete: 'удалены'
    };

    const tableName = tableTranslated[table as keyof typeof tableTranslated] || table;

    setNotifications(prev => [...prev, {id, action: actions[type], tableName, type}]);

    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if(!context) {
    throw new Error('Ошибка в NotitficationProvider');
  }
  return context;
};