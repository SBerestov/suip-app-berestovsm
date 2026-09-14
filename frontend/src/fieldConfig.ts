export const FIELD_TRANSLATIONS: Record<string, Record<string, string>> = {
  os: {
    ID: "ID",
    REGION: "Регион",
    HOST_NAME: "Имя хоста",
    HOST_NAME_CMDB: "Имя хоста (CMDB)",
    KE: "KE",
    PLATFORM_ADDRESS: "Адрес площадки",
    CATEGORY: "Категория",
    EQUIPMENT_TYPE: "Тип оборудования",
    SERVER_TYPE: "Тип сервера",
    EQUIPMENT_MODEL: "Модель оборудования",
    CMDB_STATUS: "Статус",
    CPU: "CPU",
    RAM: "ОЗУ",
    HDD: "HDD",
    TL: "TL",
    OS: "ОС",
    UPDATE_COMMENTS: "Комментарии обновления",
    INVENTORY_NUMBER: "Инвентарный номер",
    EXPLOITATION_DATE: "Дата эксплуатации",
    SERIAL_NUMBER: "Серийный номер",
    OS_NAME: "Название ОС",
    CPU_QUANTITY: "Кол-во CPU",
    CORES_NUM: "Кол-во ядер",
    MEMORY_GB: "Память (ГБ)",
    HDD_GB: "HDD (ГБ)",
    HDD_TYPE: "Тип HDD",
    HDD_QUANTITY: "Кол-во HDD",
    STATUS: "Статус",
  },
  works: {
    ID: "ID",
    DESCRIPTION: "Описание работ",
    OS: "ОС",
    PLANNED_DATE: "Запланированная дата",
    ACTUAL_DATE: "Фактическая дата",
    STATUS: "Статус",
    COMMENT: "Комментарий",
    MATERIALS_COUNT: "Кол-во материалов",
  },
  materials: {
    ID: "ID",
    TYPE: "Тип комплектующего",
    NAME: "Название модели",
    PART_NUMBER: "Артикул производителя",
    SERIAL_NUMBER: "Серийный номер",
    QUANTITY: "Количество",
    COMPATIBILITY: "Совместимость",
    WAYBILL_NUMBER: "Номер накладной",
    STORE_ADDRESS: "Адрес склада",
    ROW: "Ряд",
    SHELF: "Полка",
    CONTAINER: "Контейнер",
    RECEIVE_DATE: "Дата получения",
    COMMENT: "Комментарий",
  },
  equipment: {
    ID: "ID",
    MODEL: "Модель оборудования",
    MODEL_SERIES: "Серия модели",
    COMMENT: "Комментарий",
  },
};

export const STATUS_OPTIONS: Record<string, string[]> = {
  works: ["Запланировано", "В процессе", "Завершено"],
  os: [
    "В эксплуатации",
    "Снят с эксплуатации",
    "В разработке/На тестировании",
  ],
};

export type SelectSource = "status" | "os_models" | "equipment_models";

export const SELECT_FIELDS: Record<string, Record<string, SelectSource>> = {
  works: { OS: "os_models", STATUS: "status" },
  os: { EQUIPMENT_MODEL: "equipment_models", CMDB_STATUS: "status" },
};

export const translateField = (table: string, key: string): string =>
  FIELD_TRANSLATIONS[table]?.[key] ?? key;

export const getSelectSource = (
  table: string,
  key: string
): SelectSource | undefined => SELECT_FIELDS[table]?.[key];

export const getSelectOptions = (
  table: string,
  source: SelectSource,
  loaded: Record<string, string[]>
): string[] => (source === "status" ? STATUS_OPTIONS[table] || [] : loaded[source] || []);
