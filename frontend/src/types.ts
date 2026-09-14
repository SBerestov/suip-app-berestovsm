export type TableType = 'os' | 'works' | 'materials' | 'equipment';

export interface BaseItem {
  ID: number;
  IMAGE_PATH: string;
  STATUS: string;
}

export interface OsItem extends BaseItem {
  EQUIPMENT_MODEL: string;
  HOST_NAME: string;
  PLATFORM_ADDRESS: string;
  INVENTORY_NUMBER: string;
  CMDB_STATUS: string;
}

export interface MaterialsItem extends BaseItem {
  TYPE: string;
  NAME: string;
  QUANTITY: number;
  STORE_ADDRESS: string;
  SERIAL_NUMBER: string;
  PART_NUMBER: string;
  RECEIVE_DATE: string;
  ROW: string;
  SHELF: string;
  CONTAINER: string;
  IMAGES: string[];
}

export interface WorksItem extends BaseItem {
  DESCRIPTION: string;
  OS: string;
  PLANNED_DATE: string;
  MATERIALS_COUNT: number;
}

export interface WorkMaterial {
  LINK_ID: number;
  MATERIAL_ID: number;
  MATERIAL_NAME: string;
  MATERIAL_TYPE: string;
  PART_NUMBER: string | null;
  SERIAL_NUMBER: string | null;
  STORE_ADDRESS: string | null;
  PLANNED_QUANTITY: number | null;
  ACTUAL_QUANTITY: number | null;
  NOTE: string | null;
}

export interface MaterialWork {
  LINK_ID: number;
  WORK_ID: number;
  WORK_NAME: string;
  OS: string;
  STATUS: string;
  PLANNED_DATE: string;
  PLANNED_QUANTITY: number | null;
  ACTUAL_QUANTITY: number | null;
  NOTE: string | null;
}

export interface EquipmentItem extends BaseItem {
  MODEL: string;
  MODEL_SERIES: string;
}