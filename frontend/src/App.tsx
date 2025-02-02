import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ApiResponse,
  PreviewData,
  ErrorRows,
  ErrorMessage,
  SheetError,
} from "./types/types";
import { Drop } from "./components/Drop";
import { Table } from "./components/Table";
import { DeleteDialog } from "./components/DeleteDialog";
import { ErrorMessageBox } from "./components/ErrorMessage";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData>({});
  const [deleteRowIndex, setDeleteRowIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorRows, setErrorRows] = useState<ErrorRows>({});
  const [successRows, setSuccessRows] = useState<Set<number>>(new Set());
  const [errorMessages, setErrorMessages] = useState<ErrorMessage[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [deletedRows, setDeletedRows] = useState<Record<string, Set<number>>>(
    {}
  );

  useEffect(() => {
    console.log(previewData);
  }, [previewData]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      if (uploadedFile.size > 2 * 1024 * 1024) {
        alert("File size should not exceed 2MB");
        return;
      }
      setFile(uploadedFile);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "array" });

          // Get all sheet names and set the first one as selected
          const sheets = workbook.SheetNames;
          setSheetNames(sheets);
          setSelectedSheet(sheets[0]);

          // Load data from ALL sheets
          const allSheetData: PreviewData = {};
          sheets.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              raw: false,
              dateNF: "dd-mm-yyyy",
            });

            const filteredData = jsonData
              .filter(
                (row) =>
                  Array.isArray(row) &&
                  row.some(
                    (cell) => cell !== null && cell !== undefined && cell !== ""
                  )
              )
              .map((row) =>
                row.map((cell) => {
                  // Handle Excel serial date numbers
                  if (
                    typeof cell === "string" &&
                    cell.match(/^\d+(\.\d+)?$/) &&
                    XLSX.SSF.is_date(cell)
                  ) {
                    const serialDate = parseFloat(cell);
                    const date = XLSX.SSF.parse_date_code(serialDate);
                    return `${String(date.d).padStart(2, "0")}-${String(
                      date.m
                    ).padStart(2, "0")}-${String(date.y)}`;
                  }
                  if (cell instanceof Date) {
                    return cell
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                      .replace(/\//g, "/");
                  }
                  return cell;
                })
              );

            allSheetData[sheetName] = filteredData;
          });

          setPreviewData(allSheetData);
        } catch (error) {
          console.error("Error reading Excel file:", error);
          alert(
            "Error reading Excel file. Please make sure it's a valid Excel file."
          );
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    }
  }, []);

  const handleSheetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSheet = event.target.value;
    setSelectedSheet(newSheet);
  };

  const currentSheetData = previewData[selectedSheet] || [];
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = currentSheetData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil((currentSheetData.length - 1) / rowsPerPage);

  const handleImport = async () => {
    if (!file || Object.keys(previewData).length === 0) return;

    setIsLoading(true);
    setErrorRows({});
    setSuccessRows(new Set());
    setErrorMessages([]);

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Process each sheet
    Object.entries(previewData).forEach(([sheetName, sheetData]) => {
      console.log(`Processing sheet: ${sheetName}`);
      const deletedRowsSet = deletedRows[sheetName] || new Set();
      const headerRow = sheetData[0];
      const dataRows = sheetData.slice(1);

      // Filter out deleted rows
      const filteredDataRows = dataRows.filter((row, index) => {
        const actualRowIndex = index + 1;
        return (
          !deletedRowsSet.has(actualRowIndex) &&
          Array.isArray(row) &&
          row.some((cell) => cell !== null && cell !== undefined && cell !== "")
        );
      });

      // Combine header and filtered rows
      const finalSheetData = [headerRow, ...filteredDataRows];

      // Add the sheet to the workbook
      const ws = XLSX.utils.aoa_to_sheet(finalSheetData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Convert the workbook to a blob
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const filteredFile = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const formData = new FormData();
    formData.append("file", filteredFile, file.name);

    try {
      const response = await axios.post<ApiResponse>(
        "http://localhost:3000/api/v1/excel/upload",
        formData
      );

      // Handle successful uploads
      if (response.data.success?.uploadedSheets) {
        response.data.success.uploadedSheets.forEach((sheet) => {
          toast.success(
            `Successfully uploaded ${sheet.uploadedCount} row(s) from sheet ${sheet.sheetName}`
          );
        });
      }

      // Handle errors from all sheets
      if (response.data.errors) {
        const allErrors: ErrorMessage[] = [];
        const newErrorRows: ErrorRows = {};

        response.data.errors.forEach((sheetError: SheetError) => {
          if (sheetError.details) {
            const errorsWithSheet = sheetError.details.map((detail) => ({
              ...detail,
              sheetName: sheetError.sheetName,
            }));
            allErrors.push(...errorsWithSheet);

            // Initialize Set for this sheet if it doesn't exist
            newErrorRows[sheetError.sheetName] = new Set(
              sheetError.details.map((detail) => detail.row)
            );
          }
        });

        setErrorRows(newErrorRows);
        setErrorMessages(allErrors);
      }

      toast.info(response.data.message);
    } catch (error) {
      console.error("Error:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to import file");
      } else {
        toast.error("Failed to import file");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeError = (row: number, errorIndex: number) => {
    setErrorMessages((prevErrors) => {
      const newErrors = [...prevErrors];
      const rowErrorIndex = newErrors.findIndex(
        (e) => e.row === row && e.sheetName === selectedSheet
      );
      if (rowErrorIndex !== -1) {
        const newErrorsForRow = [...newErrors[rowErrorIndex].errors];
        newErrorsForRow.splice(errorIndex, 1);
        if (newErrorsForRow.length === 0) {
          newErrors.splice(rowErrorIndex, 1);
          setErrorRows((prev) => {
            const newErrorRows = { ...prev };
            if (newErrorRows[selectedSheet]) {
              const newSet = new Set(newErrorRows[selectedSheet]);
              newSet.delete(row);
              newErrorRows[selectedSheet] = newSet;
            }
            return newErrorRows;
          });
        } else {
          newErrors[rowErrorIndex] = {
            ...newErrors[rowErrorIndex],
            errors: newErrorsForRow,
          };
        }
      }
      return newErrors;
    });
  };

  const handleDeleteRow = (index: number) => {
    // Convert the display index back to the actual data index
    const actualIndex = index - 1; // Subtract 1 because the first row is headers
    setDeleteRowIndex(actualIndex);
  };

  const confirmDelete = () => {
    if (deleteRowIndex !== null) {
      // Track deleted row before modifying the data
      setDeletedRows((prev) => {
        const newDeletedRows = { ...prev };
        if (!newDeletedRows[selectedSheet]) {
          newDeletedRows[selectedSheet] = new Set();
        }
        // Add the actual row index to the set
        newDeletedRows[selectedSheet].add(deleteRowIndex + 1);
        console.log("Updated deletedRows:", newDeletedRows);
        return newDeletedRows;
      });

      setPreviewData((prevData) => {
        const newData = { ...prevData };
        newData[selectedSheet] = [...prevData[selectedSheet]];
        // Don't actually remove the row, just mark it as deleted
        return newData;
      });

      setDeleteRowIndex(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">File Import</h1>
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected file: {file.name}
            </p>
          )}
        </div>

        {currentSheetData.length === 0 ? (
          <Drop onDrop={onDrop} />
        ) : (
          <>
            <Table
              deletedRows={deletedRows}
              selectedSheet={selectedSheet}
              sheetNames={sheetNames}
              currentSheetData={currentSheetData}
              handleSheetChange={handleSheetChange}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              errorRows={errorRows}
              successRows={successRows}
              handleDeleteRow={handleDeleteRow}
              isLoading={isLoading}
              handleImport={handleImport}
              indexOfFirstRow={indexOfFirstRow}
              currentRows={currentRows}
            />
          </>
        )}

        {deleteRowIndex !== null && (
          <>
            <DeleteDialog
              confirmDelete={confirmDelete}
              setDeleteRowIndex={setDeleteRowIndex}
            />
          </>
        )}

        {errorMessages.length > 0 && (
          <>
            <ErrorMessageBox
              errorMessages={errorMessages}
              removeError={removeError}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
