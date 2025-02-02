export const Table = ({
  selectedSheet,
  sheetNames,
  currentSheetData,
  handleSheetChange,
  currentPage,
  totalPages,
  setCurrentPage,
  errorRows,
  successRows,
  handleDeleteRow,
  isLoading,
  handleImport,
  indexOfFirstRow,
  currentRows,
  deletedRows,
}: any) => {
  return (
    <>
      <div className="w-full max-w-2xl mb-4">
        <select
          value={selectedSheet}
          onChange={handleSheetChange}
          className="mt-4 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {sheetNames.map((sheet) => (
            <option key={sheet} value={sheet}>
              {sheet}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8 overflow-x-auto w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">File Preview</h2>
        <table className="min-w-full border-collapse border border-gray-300">
          <tbody>
            {currentSheetData.length > 0 && (
              <tr className="bg-gray-100">
                {Array.isArray(currentSheetData[0]) &&
                  currentSheetData[0].map((cell, index) => (
                    <th
                      key={index}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {String(cell)}
                    </th>
                  ))}
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            )}

            {currentRows.slice(1).map((row, rowIndex) => {
              const actualRowIndex = indexOfFirstRow + rowIndex + 1;
              const isRowEmpty =
                Array.isArray(row) &&
                row.every(
                  (cell) => cell === null || cell === undefined || cell === ""
                );
              const isDeleted = deletedRows[selectedSheet]?.has(actualRowIndex);

              if (isRowEmpty || isDeleted) return null;

              return (
                <tr
                  key={actualRowIndex}
                  className={`${
                    errorRows[selectedSheet]?.has(actualRowIndex)
                      ? "bg-red-100"
                      : successRows.has(actualRowIndex)
                      ? "bg-green-100"
                      : ""
                  }`}
                >
                  {Array.isArray(row) &&
                    row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 px-4 py-2"
                      >
                        {String(cell)}
                      </td>
                    ))}

                  {actualRowIndex > 0 && (
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() => handleDeleteRow(actualRowIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleImport}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? "Importing..." : "Import Data"}
        </button>
      </div>
    </>
  );
};
