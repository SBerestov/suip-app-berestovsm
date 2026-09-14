import React from "react";
import type { WorkMaterial } from "../../types";
import { useNotifications } from "../../context/NotificationContext";

interface MaterialOption {
  ID: number;
  NAME: string;
  TYPE: string;
  QUANTITY: number;
}

interface WorkMaterialsEditorProps {
  workId: number;
}

export const WorkMaterialsEditor: React.FC<WorkMaterialsEditorProps> = ({
  workId,
}) => {
  const { showNotification } = useNotifications();

  const [materials, setMaterials] = React.useState<MaterialOption[]>([]);
  const [links, setLinks] = React.useState<WorkMaterial[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [selectedMaterialId, setSelectedMaterialId] = React.useState("");
  const [plannedQty, setPlannedQty] = React.useState("");
  const [actualQty, setActualQty] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const linkIds = links.map((l) => l.MATERIAL_ID);

  const refresh = React.useCallback(async () => {
    const [matRes, linkRes] = await Promise.all([
      fetch("/api/materials"),
      fetch(`/api/works/${workId}/materials`),
    ]);
    const matJson = await matRes.json();
    const linkJson = await linkRes.json();
    setMaterials(matJson.data);
    setLinks(linkJson.data);
  }, [workId]);

  React.useEffect(() => {
    setLoading(true);
    refresh()
      .catch((e) => console.error("Ошибка загрузки материалов", e))
      .finally(() => setLoading(false));
  }, [refresh]);

  const handleAdd = async () => {
    if (!selectedMaterialId) return;

    const selected = materials.find((m) => m.ID === Number(selectedMaterialId));
    const requested = Number(actualQty) || 0;
    if (selected && requested > selected.QUANTITY) {
      alert(
        `Недостаточно на складе: остаток ${selected.QUANTITY}, запрошено ${requested}`
      );
      return;
    }

    setAdding(true);
    try {
      const response = await fetch(`/api/works/${workId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MATERIAL_ID: Number(selectedMaterialId),
          PLANNED_QUANTITY: plannedQty,
          ACTUAL_QUANTITY: actualQty,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Ошибка добавления материала");
      }

      setSelectedMaterialId("");
      setPlannedQty("");
      setActualQty("");
      await refresh();
      showNotification("works", "update");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Неизвестная ошибка";
      alert("Ошибка добавления материала: " + message);
    } finally {
      setAdding(false);
    }
  };

  const setLocalQty = (
    linkId: number,
    field: "PLANNED_QUANTITY" | "ACTUAL_QUANTITY",
    value: string
  ) => {
    setLinks((prev) =>
      prev.map((l) => (l.LINK_ID === linkId ? { ...l, [field]: value } : l))
    );
  };

  const handleUpdate = async (
    linkId: number,
    field: "PLANNED_QUANTITY" | "ACTUAL_QUANTITY",
    value: string
  ) => {
    const response = await fetch(`/api/works_materials/${linkId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      alert("Ошибка обновления: " + (error.error || "Неизвестная ошибка"));
      return;
    }

    showNotification("works", "update");
  };

  const handleRemove = async (linkId: number) => {
    if (!window.confirm("Убрать этот материал из работы?")) return;

    const response = await fetch(`/api/works_materials/${linkId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      alert("Ошибка удаления: " + (error.error || "Неизвестная ошибка"));
      return;
    }

    await refresh();
    showNotification("works", "delete");
  };

  const availableMaterials = materials.filter(
    (m) => !linkIds.includes(m.ID)
  );

  return (
    <div className="col-start-1 col-end-[-1] md:col-span-2 lg:col-span-3 rounded-xl border border-[#e5e5e5] p-4">
      <h3 className="text-[16px] font-bold mb-3">Материалы</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Загрузка...</p>
      ) : (
        <>
          {links.length === 0 ? (
            <p className="text-sm text-gray-500 mb-3">Материалы не добавлены</p>
          ) : (
            <ul className="flex flex-col gap-2 mb-4">
              {links.map((link) => (
                <li
                  key={link.LINK_ID}
                  className="flex items-center gap-2 flex-wrap bg-gray-50 rounded-xl px-3 py-2"
                >
                  <span className="text-[15px] font-semibold min-w-[140px]">
                    {link.MATERIAL_NAME || link.MATERIAL_TYPE || `Материал #${link.MATERIAL_ID}`}
                  </span>
                  <label className="flex items-center gap-1 text-sm">
                    План:
                    <input
                      type="number"
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1"
                      value={link.PLANNED_QUANTITY ?? ""}
                      onChange={(e) =>
                        setLocalQty(link.LINK_ID, "PLANNED_QUANTITY", e.target.value)
                      }
                      onBlur={(e) =>
                        handleUpdate(link.LINK_ID, "PLANNED_QUANTITY", e.target.value)
                      }
                    />
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    Факт:
                    <input
                      type="number"
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1"
                      value={link.ACTUAL_QUANTITY ?? ""}
                      onChange={(e) =>
                        setLocalQty(link.LINK_ID, "ACTUAL_QUANTITY", e.target.value)
                      }
                      onBlur={(e) =>
                        handleUpdate(link.LINK_ID, "ACTUAL_QUANTITY", e.target.value)
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemove(link.LINK_ID)}
                    className="ml-auto text-sm font-bold text-[#FF0000] hover:bg-red-50 rounded-lg px-2 py-1 cursor-pointer"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm min-w-[200px]"
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
            >
              <option value="">Выберите материал...</option>
              {availableMaterials.map((m) => (
                <option key={m.ID} value={m.ID}>
                  {m.NAME || m.TYPE} {m.TYPE ? `(${m.TYPE})` : ""} — остаток:{" "}
                  {m.QUANTITY}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="План"
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm w-24"
              value={plannedQty}
              onChange={(e) => setPlannedQty(e.target.value)}
            />
            <input
              type="number"
              placeholder="Факт"
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm w-24"
              value={actualQty}
              onChange={(e) => setActualQty(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding || !selectedMaterialId}
              className="bg-black text-white font-bold text-sm rounded-xl px-4 py-2 cursor-pointer hover:bg-gray-800 disabled:opacity-50"
            >
              {adding ? "Добавление..." : "Добавить"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
