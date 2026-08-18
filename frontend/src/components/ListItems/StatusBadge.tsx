import React from "react";

interface StatusBadgeProps {
  status: string;
}

const statusClasses: Record<string, string> = {
  "В эксплуатации": "bg-[#08F29B]", // В работе
  "В разработке/На тестировании": "bg-[#F5ED31]", // В обслуживании
  "На складе": "bg-[#3DADFF]", // На складе
  "Снят с эксплуатации": "bg-[#FF7556]", // Выведены из эксплуатации
  Завершено: "bg-[#08F29B]",
  "В процессе": "bg-[#F5ED31]",
  Запланировано: "bg-[#3DADFF]",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`px-3 py-0.75 rounded-xl text-sm font-bold ${
        statusClasses[status] || "bg-gray-200"
      }`}
    >
      {status}
    </span>
  );
};
