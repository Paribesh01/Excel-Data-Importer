import { useDropzone } from "react-dropzone";

export const Drop = ({ onDrop }: { onDrop: (files: File[]) => void }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxFiles: 1,
  });
  return (
    <>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the Excel file here...</p>
        ) : (
          <div>
            <p className="mb-2">
              Drag and drop an Excel file here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Only .xlsx files up to 2MB are accepted
            </p>
          </div>
        )}
      </div>
    </>
  );
};
