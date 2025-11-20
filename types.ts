export type TableData = string[][];

export interface ExtractionResult {
  data: TableData | null;
  error: string | null;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface CellCoordinate {
  rowIndex: number;
  colIndex: number;
}