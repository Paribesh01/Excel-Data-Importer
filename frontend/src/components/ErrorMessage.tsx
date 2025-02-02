export const ErrorMessageBox = ({ errorMessages, removeError }: any) => {
  return (
    <div className="mt-4 w-full max-w-2xl">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium mb-2">Validation Errors:</h3>
        {errorMessages.map((errorObj, index) => (
          <div key={`${errorObj.row}-${index}`} className="mb-2">
            {errorObj.errors.map((error, errorIndex) => (
              <div
                key={errorIndex}
                className="flex items-center justify-between text-red-700 mb-1"
              >
                <span>
                  Sheet {errorObj.sheetName}, Row {errorObj.row}: {error}
                </span>
                <button
                  onClick={() => removeError(errorObj.row, errorIndex)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
