export interface SheetData {
  sheetName: string;
  data: unknown[][];
}

export interface UploadedSheet {
  sheetName: string;
  uploadedCount: number;
}

export interface ErrorDetail {
  row: number;
  errors: string[];
}

export interface SheetError {
  sheetName: string;
  details?: ErrorDetail[];
}

export interface ApiResponse {
  success?: {
    uploadedSheets: UploadedSheet[];
  };
  errors?: SheetError[];
  message: string;
}

export interface ErrorMessage extends ErrorDetail {
  sheetName: string;
}

export interface PreviewData {
  [key: string]: any[][];
}

export interface ErrorRows {
  [sheetName: string]: Set<number>;
}

export interface ErrorState {
  [key: string]: Set<number>;
}

export interface SheetSelectorProps {
  sheets: string[];
  selectedSheet: string;
  onSheetChange: (sheet: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
