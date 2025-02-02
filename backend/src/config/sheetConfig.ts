export interface FieldConfig {
  required?: boolean;
  type: "string" | "number" | "date" | "boolean";
  allowZero?: boolean;
  allowPreviousMonth?: boolean;
  validValues?: string[];
  dbField: string;
}

export interface SheetConfig {
  [sheetName: string]: {
    fields: {
      [excelColumn: string]: FieldConfig;
    };
  };
}

export const sheetConfigurations: SheetConfig = {
  Default: {
    fields: {
      Name: {
        required: true,
        type: "string",
        dbField: "name",
      },
      Amount: {
        required: true,
        type: "number",
        allowZero: false,
        dbField: "amount",
      },
      Date: {
        required: true,
        type: "date",
        allowPreviousMonth: false,
        dbField: "date",
      },
      Verified: {
        required: true,
        type: "boolean",
        validValues: ["Yes", "No"],
        dbField: "verified",
      },
    },
  },
  Invoices: {
    fields: {
      "Invoice Number": {
        required: true,
        type: "string",
        dbField: "invoiceNumber",
      },
      "Invoice Date": {
        required: true,
        type: "date",
        allowPreviousMonth: true,
        dbField: "invoiceDate",
      },
      "Receipt Date": {
        required: false,
        type: "date",
        allowPreviousMonth: true,
        dbField: "receiptDate",
      },
      Amount: {
        required: true,
        type: "number",
        allowZero: true,
        dbField: "amount",
      },
    },
  },
};
