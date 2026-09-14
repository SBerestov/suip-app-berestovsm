import React from "react";
import type { MaterialWork } from "../../types";

interface MaterialUsageListProps {
  materialId: number;
}

export const MaterialUsageList: React.FC<MaterialUsageListProps> = ({
  materialId,
}) => {
  const [works, setWorks] = React.useState<MaterialWork[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/materials/${materialId}/works`)
      .then((res) => res.json())
      .then((result) => setWorks(result.data))
      .catch((e) => console.error("Ошибка загрузки работ материала", e))
      .finally(() => setLoading(false));
  }, [materialId]);

  return (
    <div className="col-start-1 col-end-[-1] md:col-span-2 lg:col-span-3 rounded-xl border border-[#e5e5e5] p-4">
      <h3 className="text-[16px] font-bold mb-3">Использован в работах</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Загрузка...</p>
      ) : works.length === 0 ? (
        <p className="text-sm text-gray-500">Материал пока не используется</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {works.map((work) => (
            <li
              key={work.LINK_ID}
              className="flex items-center gap-2 flex-wrap bg-gray-50 rounded-xl px-3 py-2"
            >
              <span className="text-[15px] font-semibold min-w-[140px]">
                {work.WORK_NAME || `Работа #${work.WORK_ID}`}
              </span>
              <span className="bg-black text-white rounded-xl px-2.5 py-0.5 text-xs font-bold">
                {work.OS}
              </span>
              <span className="bg-gray-200 text-gray-700 rounded-xl px-2.5 py-0.5 text-xs font-bold">
                План: {work.PLANNED_QUANTITY ?? "-"}
              </span>
              <span className="bg-gray-200 text-gray-700 rounded-xl px-2.5 py-0.5 text-xs font-bold">
                Факт: {work.ACTUAL_QUANTITY ?? "-"}
              </span>
              <span className="text-sm text-gray-600">{work.STATUS}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
