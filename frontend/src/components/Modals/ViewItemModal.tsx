import React from "react";
import { Modal } from "./Modal";
import { useNotifications } from "../../context/NotificationContext";
import { ImageUploadModal } from "./ImageUploadModal";
import { WorkMaterialsEditor } from "./WorkMaterialsEditor";
import { MaterialUsageList } from "./MaterialUsageList";
import {
  getSelectSource,
  getSelectOptions,
  translateField,
} from "../../fieldConfig";

interface ViewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  tableType: string;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, data: any) => Promise<void>;
  title?: string;
}

const HIDDEN_FIELDS: Record<string, string[]> = {
  works: [
    "MATERIALS_LIST",
    "MATERIALS_PLANNED_QUANTITY",
    "MATERIALS_ACTUAL_QUANTITY",
    "MATERIALS_COUNT",
  ],
  os: ["STATUS"],
};

export const ViewItemModal: React.FC<ViewItemModalProps> = ({
  isOpen,
  onClose,
  data,
  tableType,
  onDelete,
  onUpdate,
  title,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState(data);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [imageArray, setImageArray] = React.useState<string[]>(
    data?.IMAGE_PATH ? data.IMAGE_PATH.split(",") : []
  );
  const [options, setOptions] = React.useState<Record<string, string[]>>({});

  const { showNotification } = useNotifications();

  React.useEffect(() => {
    setFormData(data);

    if (data?.IMAGE_PATH) {
      const newImages = data.IMAGE_PATH.split(",");
      setImageArray(newImages);
    } else {
      setImageArray([]);
    }
  }, [data]);

  React.useEffect(() => {
    if (!isOpen) return;

    const sources = new Set(
      Object.keys(data || {})
        .map((key) => getSelectSource(tableType, key))
        .filter(Boolean)
    );

    const fetchOption = async (kind: string) => {
      const res = await fetch(`/api/options/${kind}`);
      const json = await res.json();
      setOptions((prev) => ({ ...prev, [kind]: json.data }));
    };

    if (sources.has("os_models")) fetchOption("os_models").catch(() => {});
    if (sources.has("equipment_models"))
      fetchOption("equipment_models").catch(() => {});
  }, [isOpen, tableType, data]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      await onUpdate(data.ID, formData);
      showNotification(tableType, "update");
      setIsEditing(false);
    } catch (error: any) {
      alert("Ошибка редактирования записи: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить эту запись?")) {
      try {
        await onDelete(data.ID);
        showNotification(tableType, "delete");
        onClose();
      } catch (error: any) {
        alert("Ошибка удаления записи: " + error.message);
      }
    }
  };

  const renderFields = () => {
    if (!data) return null;

    const hidden = HIDDEN_FIELDS[tableType] || [];

    const inputClass =
      "text-[16px] font-semibold border-0 pt-1.25 outline-none relative border-b-2 border-transparent hover:border-gray-300 focus:border-black focus:outline-none";

    return Object.entries(data)
      .filter(
        ([key]) =>
          key !== "IMAGE_PATH" &&
          key !== "COMMENT" &&
          key !== "UPDATE_COMMENTS" &&
          key !== "ID" &&
          !hidden.includes(key)
      )
      .map(([key]) => {
        const source = getSelectSource(tableType, key);
        const currentValue = String(formData[key] ?? "");

        if (source) {
          const baseOptions = getSelectOptions(tableType, source, options);
          const selectOptions =
            currentValue && !baseOptions.includes(currentValue)
              ? [currentValue, ...baseOptions]
              : baseOptions;

          return (
            <div key={key} className="grid items-center flex-wrap mb-4">
              <label className="basis-[150px] mr-5 text-sm text-[#515151]">
                {translateField(tableType, key)}:
              </label>
              <select
                className={`${inputClass} cursor-pointer bg-transparent min-w-0`}
                value={currentValue}
                onChange={(e) => handleInputChange(key, e.target.value)}
              >
                <option value="">—</option>
                {selectOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div key={key} className="grid items-center flex-wrap mb-4">
            <label className="basis-[150px] mr-5 text-sm text-[#515151]">
              {translateField(tableType, key)}:
            </label>
            <input
              className={inputClass}
              type="text"
              onChange={(e) => handleInputChange(key, e.target.value)}
              value={currentValue}
            />
          </div>
        );
      });
  };

  const handleImagesUpdate = (newImages: string[]) => {
    setImageArray(newImages);

    setFormData((prev: any) => ({
      ...prev,
      IMAGE_PATH: newImages.join(","),
    }));
  };

  const displayImage =
    imageArray.length > 0 ? `/api/${imageArray[0]}` : "/images/krisa.webp";

  if (!data) return null;

  const commentField = () => {
    if (formData.hasOwnProperty("COMMENT")) return "COMMENT";
    if (formData.hasOwnProperty("UPDATE_COMMENTS")) return "UPDATE_COMMENTS";
    return "";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      customClass={"w-[90vw] md:max-w-[80vw] lg:max-w-[60vw]"}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 max-h-100 overflow-y-auto overflow-x-hidden pr-2 mr-[-8px]">
        <div className="flex flex-col col-start-1 col-end-[-1] justify-center items-center gap-2">
          <img
            src={displayImage}
            key={displayImage}
            id="currentImage"
            className="max-w-[300px] max-h-[300px] object-cover rounded-[20px] cursor-pointer"
            onClick={() => setIsImageModalOpen(true)}
          />
          <button
            type="button"
            onClick={() => setIsImageModalOpen(true)}
            className="bg-[#0079FF] text-white cursor-pointer text-[16px] font-bold py-2.5 px-6.75 rounded-4xl border-0"
          >
            Изменить
          </button>
        </div>

        {isImageModalOpen && (
          <ImageUploadModal
            isOpen={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            currentImages={imageArray}
            tableType={tableType}
            entryId={formData?.ID}
            onImagesChange={handleImagesUpdate}
          />
        )}

        {tableType === "works" && (
          <WorkMaterialsEditor workId={data.ID} />
        )}

        {tableType === "materials" && (
          <MaterialUsageList materialId={data.ID} />
        )}

        {renderFields()}
        <div className="col-start-1 col-end-[-1] md:col-span-2 lg:col-span-3">
          <label className="pb-1.25 basis-[150px] mr-5 text-sm text-[#515151]">
            Комментарий
          </label>
          <textarea
            onChange={(e) => handleInputChange(commentField(), e.target.value)}
            value={formData.COMMENT || formData.UPDATE_COMMENTS}
            className="w-[100%] min-h-[100px] rounded-xl border-2 border-[#9f9f9f] py-3 px-4.5 text-[16px] font-semibold box-content font-sans"
          />
        </div>
      </div>
      <div className="flex justify-between gap-3 mt-5 md:justify-end md:gap-2">
        <button
          type="button"
          onClick={handleDelete}
          className="flex text-base font-bold w-full justify-center items-center py-3 px-6.75 rounded-4xl border-0 gap-2 bg-[#FF0000] text-white cursor-pointer md:w-auto hover:bg-[#FF4E4E]"
        >
          <img src="/images/delete.svg" height={24} width={24} />
          <span>Удалить</span>
        </button>
        {!isEditing ? (
          <button className="flex text-base font-bold w-full justify-center items-center py-3 px-6.75 rounded-4xl border-0 gap-2 bg-[#F0F0F0] text-[#c3c3c3] md:w-auto">
            <img src="/images/change-gray.svg" height={24} width={24} />
            <span>Изменить</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="flex text-base font-bold w-full justify-center items-center py-3 px-6.75 rounded-4xl border-0 gap-2 bg-black text-white cursor-pointer md:w-auto hover:bg-[#2f2f2f]"
          >
            <img src="/images/change-white.svg" height={24} width={24} />
            <span>{isLoading ? "Сохранение..." : "Изменить"}</span>
          </button>
        )}
      </div>
    </Modal>
  );
};
