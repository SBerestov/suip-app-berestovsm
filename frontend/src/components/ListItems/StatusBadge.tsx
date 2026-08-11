import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const statusClasses: Record<string, string> = {
    'В работе': 'bg-[#08F29B]',
    'В обслуживании': 'bg-[#F5ED31]',
    'На складе': 'bg-[#3DADFF]',
    'Выведены из эксплуатации': 'bg-[#FF7556]',
    'Завершено': 'bg-[#08F29B]',
    'В процессе': 'bg-[#F5ED31]',
    'Запланировано': 'bg-[#3DADFF]',
  };

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`px-3 py-0.75 rounded-xl text-sm font-bold ${statusClasses[status] || 'bg-gray-200'}`}>
      {status}
    </span>
  );
};