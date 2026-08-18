import React from "react";
import { Modal } from "./Modal";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImages: string[];
  tableType: string;
  entryId: number;
  onImagesChange: (newImages: string[]) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  currentImages,
  tableType,
  entryId,
  onImagesChange,
}) => {
  const [filesToUpload, setFilesToUpload] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isImageSelecting, setIsImageSelecting] = React.useState(false);
  const [galleryImages, setGalleryImages] = React.useState<string[]>(
    currentImages || []
  );
  const [currentIndexImage, setCurrentIndexImage] = React.useState<number>(0);
  const [selectedImages, setSelectedImages] = React.useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = [...e.target.files];
      setFilesToUpload((prev) => [...prev, ...filesArray]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const filesArray = [...e.dataTransfer.files];
      setFilesToUpload((prev) => [...prev, ...filesArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleImageSelect = (image: string) => {
    setSelectedImages((prev) => {
      if (prev.includes(image)) {
        return prev.filter((img) => img !== image);
      } else {
        return [...prev, image];
      }
    });
  };

  const removeGalleryImages = async (images: string[]) => {
    setIsDeleting(true);

    try {
      const filenames = Array.isArray(images) ? images : [images];

      const response = await fetch(
        `/api/delete_images/${tableType}/${entryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image_filenames: filenames }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        const updatedImages = galleryImages.filter(
          (img) => !images.includes(img)
        );
        console.log(updatedImages);
        setGalleryImages(updatedImages);
        onImagesChange(updatedImages);
        setSelectedImages([]);
      } else {
        alert("Ошибка удаления изображений");
      }
    } catch (error) {
      alert("Ошибка удаления изображений: " + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpload = async () => {
    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    filesToUpload.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(
        `/api/upload_images/${tableType}/${entryId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        const allImages = [...galleryImages, ...result.images];

        setGalleryImages(allImages);
        onImagesChange(allImages);

        setFilesToUpload([]);
        setIsImageSelecting(false);
      } else {
        const error = await response.json();
        alert("Ошибка загрузки изображений: " + error.error);
      }
    } catch (error) {
      alert("Ошибка загрузки изображений" + error);
    } finally {
      setIsUploading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;

      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={"Изменение изображения"}
      customClass={"w-[90vw] min-h-[90vh]"}
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden gap-4">
        {galleryImages.length > 0 && (
          <div className="flex-1 min-h-0 overflow-auto rounded-lg relative">
            <img
              src={`/api/${galleryImages[currentIndexImage]}`}
              alt="current"
              className="max-w-full mx-auto max-h-full rounded-4xl object-contain"
            />

            <button
              className="fixed top-[41%] -translate-y-1/2 left-7 md:left-8 z-10 flex gap-1 py-2 px-4 cursor-pointer rounded-3xl text-white bg-black/70 backdrop-blur-sm hover:bg-black/80 transition-colors"
              type="button"
              onClick={() => setCurrentIndexImage(currentIndexImage - 1)}
              disabled={currentIndexImage === 0}
            >
              <img
                src="/images/arrow-sm-left.svg"
                height={24}
                width={24}
                alt="Назад"
              />
              <span className="hidden sm:inline">Назад</span>
            </button>

            <button
              className="fixed top-[41%] -translate-y-1/2 right-7 md:right-11.5 z-10 flex gap-1 py-2 px-4 cursor-pointer rounded-3xl text-white bg-black/70 backdrop-blur-sm hover:bg-black/80 transition-colors"
              type="button"
              onClick={() => setCurrentIndexImage(currentIndexImage + 1)}
              disabled={currentIndexImage === galleryImages.length - 1}
            >
              <span className="hidden sm:inline">Вперед</span>
              <img
                src="/images/arrow-sm-right.svg"
                height={24}
                width={24}
                alt="Вперед"
              />
            </button>

            <div className="fixed bottom-[35%] md:bottom-[30%] left-1/2 -translate-x-1/2 z-10">
              <span className="py-2 px-4 rounded-3xl text-white bg-black/70 backdrop-blur-sm text-sm md:text-base">
                {currentIndexImage + 1} из {galleryImages.length}
              </span>
            </div>
          </div>
        )}

        {galleryImages.length === 0 || isImageSelecting ? (
          <div
            className={`relative border-1 rounded-4xl text-center cursor-pointer transition flex-shrink-0 ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-400"
            }`}
            onClick={() => document.getElementById("fileInput")?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
            {filesToUpload.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 p-2 -mb-2">
                {Array.from(filesToUpload).map((file, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Превью ${index + 1}`}
                      className="object-cover rounded-3xl w-26 h-26"
                      onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                    />
                    <span className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 p-8.75 md:p-11.75">
                Перетащите изображения сюда или кликните для выбора
              </p>
            )}

            {galleryImages.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsImageSelecting(false);
                }}
                className="flex absolute bottom-2 right-2 text-base font-bold items-center py-3 px-6.75 rounded-4xl border-1 gap-2 bg-gray-200 text-black cursor-pointer hover:hover:bg-gray-300"
              >
                <img src="/images/close.svg" height={24} width={24} />
                <span className="hidden md:block">Отмена</span>
              </button>
            )}
          </div>
        ) : (
          <div className=" bg-gray-200 p-2 rounded-4xl relative">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mb-2">
              {galleryImages.map((image, index) => {
                const isSelected = selectedImages.includes(image);
                const selectedIndex = isSelected
                  ? selectedImages.indexOf(image) + 1
                  : null;

                return (
                  <div
                    key={index}
                    onClick={() => handleImageSelect(image)}
                    className="relative flex-shrink-0 cursor-pointer"
                  >
                    <img
                      src={`/api/${image}`}
                      className={`rounded-3xl object-cover border-2 h-26 w-26 ${
                        isSelected ? "border-blue-500" : "border-transparent"
                      }`}
                    />
                    <div className="absolute right-2 top-2">
                      <div
                        className={`w-5 h-5 rounded-2xl border-2 border-white flex items-center justify-center ${
                          isSelected
                            ? "bg-white text-black text-xs font-bold"
                            : "bg-black/50"
                        }`}
                      >
                        {selectedIndex && <span>{selectedIndex}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsImageSelecting(true)}
              className="flex absolute bottom-2 right-2 text-base font-bold items-center py-3 px-6.75 rounded-4xl border-1 gap-2 bg-white text-black cursor-pointer hover:bg-[#f0f0f0]"
            >
              <img src="/images/paperclip.svg" height={24} width={24} />
              <span className="hidden md:block">Добавить</span>
            </button>
          </div>
        )}

        <div className="flex justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => removeGalleryImages(selectedImages)}
            disabled={selectedImages.length === 0}
            className={`flex text-base font-bold items-center py-3 px-6.75 rounded-4xl border-0 gap-2 
              ${
                selectedImages.length === 0
                  ? "bg-[#F0F0F0] text-[#c3c3c3]"
                  : "bg-[#FF0000] text-white cursor-pointer hover:bg-[#FF4E4E]"
              }`}
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className={`font-base font-bold items-center py-3 px-6.75 rounded-[30px] border-0 gap-2 h-[48px] box-border
              ${
                filesToUpload.length === 0
                  ? "bg-[#F0F0F0] text-[#c3c3c3]"
                  : "cursor-pointer bg-black text-white hover:bg-gray-800 "
              }`}
          >
            {isUploading ? "Загрузка..." : "Сохранить"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
