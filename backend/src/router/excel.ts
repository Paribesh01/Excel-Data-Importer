import express, { Request, Response } from "express";
import multer from "multer";
import xlsx from "xlsx";
import Record from "../model/Record";
import { sheetConfigurations } from "../config/sheetConfig";

const excelRouter = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .xlsx files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const validateExcelData = (data: any[], sheetName: string) => {
  const errors: any = [];
  const validData: any[] = [];

  const sheetConfig =
    sheetConfigurations[sheetName] || sheetConfigurations["Default"];

  data.forEach((row: any, index: number) => {
    let rowErrors: string[] = [];
    const validatedRow: any = {};

    Object.entries(sheetConfig.fields).forEach(([columnName, fieldConfig]) => {
      const value = row[columnName];

      if (fieldConfig.required && !value) {
        rowErrors.push(`${columnName} is required`);
        return;
      }

      switch (fieldConfig.type) {
        case "number":
          if (value) {
            const numValue = Number(value.toString().replace(/,/g, ""));
            if (isNaN(numValue) || (!fieldConfig.allowZero && numValue <= 0)) {
              rowErrors.push(
                `${columnName} must be a valid number${
                  !fieldConfig.allowZero ? " greater than 0" : ""
                }`
              );
            } else {
              validatedRow[fieldConfig.dbField] = numValue;
            }
          }
          break;

        case "date":
          if (value) {
            let dateValue: Date;
            if (value instanceof Date) {
              dateValue = value;
            } else {
              const [day, month, year] = value.split("-").map(Number);
              dateValue = new Date(year, month - 1, day);
            }

            if (isNaN(dateValue.getTime())) {
              rowErrors.push(`${columnName} is invalid`);
            } else {
              const currentMonth = new Date().getMonth();
              if (
                !fieldConfig.allowPreviousMonth &&
                dateValue.getMonth() !== currentMonth
              ) {
                rowErrors.push(
                  `${columnName} must be within the current month`
                );
              }
              validatedRow[fieldConfig.dbField] = dateValue;
            }
          }
          break;

        case "boolean":
          if (value && fieldConfig.validValues) {
            if (!fieldConfig.validValues.includes(value)) {
              rowErrors.push(
                `${columnName} must be one of: ${fieldConfig.validValues.join(
                  ", "
                )}`
              );
            } else {
              validatedRow[fieldConfig.dbField] = value === "Yes";
            }
          }
          break;

        case "string":
          if (value) {
            validatedRow[fieldConfig.dbField] = value;
          }
          break;
      }
    });

    if (rowErrors.length > 0) {
      errors.push({ row: index + 1, errors: rowErrors });
    } else {
      validData.push(validatedRow);
    }
  });

  return { errors, validData };
};

excelRouter.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded!" });
      return;
    }

    try {
      const workbook = xlsx.read(req.file.buffer);
      const sheetNames = workbook.SheetNames;

      if (sheetNames.length === 0) {
        res.status(400).json({ message: "Excel file is empty" });
        return;
      }

      const sheetsValidation = sheetNames.map((sheetName, index) => {
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (data.length === 0) {
          return {
            sheetName,
            error: `Sheet ${index + 1} (${sheetName}) is empty`,
            validData: [],
            errors: [],
          };
        }

        const { errors, validData } = validateExcelData(data, sheetName);
        return {
          sheetName,
          validData,
          errors,
          hasErrors: errors.length > 0,
        };
      });

      const uploadResults = await Promise.all(
        sheetsValidation
          .filter((sheet) => sheet.validData?.length > 0)
          .map((sheet) =>
            Record.insertMany({
              sheetName: sheet.sheetName,
              rows: sheet.validData,
            })
          )
      );

      res.json({
        message: "Files processed",
        success: {
          uploadedSheets: uploadResults.map((result, index) => ({
            sheetName: sheetsValidation[index].sheetName,
            uploadedCount: result.length,
            uploadedData: result,
          })),
        },
        errors: sheetsValidation
          .filter((sheet) => sheet.errors?.length > 0)
          .map((sheet) => ({
            sheetName: sheet.sheetName,
            skippedCount: sheet.errors.length,
            details: sheet.errors,
          })),
      });
    } catch (error: any) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error processing file", error: error.message });
    }
  }
);

export default excelRouter;
