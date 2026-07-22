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
}

export interface EquipmentItem extends BaseItem {
  MODEL: string;
  MODEL_SERIES: string;
}