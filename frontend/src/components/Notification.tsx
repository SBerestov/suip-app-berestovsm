import React from "react";
import { useNotifications } from "../context/NotificationContext";

const textColor = {
  success: "text-green-600 font-bold",
  delete: "text-[#FF0000] font-bold",
  update: "text-[#3DADFF] font-bold"
};

export const Notification: React.FC = () => {
  const { notifications } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <>
      {notifications.map(notification => (
        <div key={notification.id} className="w-[90%] fixed items-center top-5 left-[50%] -translate-x-1/2 text-black shadow-md z-5 gap-4 bg-white px-6.25 py-3.75 rounded-xl animate-[slideIn_0.3s_ease-out,fadeOut_0.5s_ease-out_2.5s_forwards] lg:w-auto">
          <img src="/images/check-green.svg" height={80} width={80} />
          <h2>
            Данные успешно{" "}
            <span className={textColor[notification.type]}>
              {notification.action}
            </span>{" "}
            в {notification.tableName}!
          </h2>
        </div>
      ))}
    </>
  );
};