# Excel Data Importer

An application for uploading, validating, previewing, and importing Excel data into a MongoDB database. It supports handling `.xlsx` files with multiple sheets, row-level validation errors, and a clean user interface for importing data. Built with React.js for the frontend, Node.js with Express.js for the backend, and MongoDB Atlas for database storage.

## Features

### Frontend:

- **File Import Page**: Drag-and-drop file upload with a fallback input button. Only accepts `.xlsx` files with a size limit of 2 MB.
- **Error Display**: Validation errors are displayed in a modal dialog, including the sheet name, row number, and error description for each invalid row.
- **Data Preview**: Dropdown to select sheets, data displayed in a paginated table.
  - Dates are formatted in **DD-MM-YYYY**.
  - Numeric values are formatted in the **Indian number format**.
  - Allows users to delete rows, with a confirmation prompt before deletion.
- **Data Import**:
  - Imports only valid rows to the database.
  - Displays a success message after the import and highlights skipped rows due to errors.

### Backend:

- **File Validation**: Validates the file to ensure required columns (`Name`, `Amount`, `Date`, `Verified`) are present and that they conform to the rules (e.g., date must be within the current month, amount must be numeric and greater than zero).
- **Support for Future Extensions**: Backend is designed to handle new sheets with different column names and validation rules, using a configuration file to map columns and validation rules.
- **Database Interaction**: Uses MongoDB Atlas to store the imported data, capable of handling large files efficiently.

## Tech Stack

- **Frontend**:
  - React.js
  - Tailwind CSS
  - TypeScript (Optional)
- **Backend**:
  - Node.js
  - Express.js
  - Mongoose (MongoDB ORM)
  - `xlsx` or `exceljs` (for Excel file processing)
- **Database**: MongoDB Atlas (Free Tier)

## Setup Instructions

### Prerequisites

Ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB Atlas account (set up a free-tier database)

### Frontend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/excel-data-importer.git
   cd excel-data-importer

   ```

2. Start Frontend:

   ```bash
   cd frontend
   npm install
   npm run dev

   ```

3. Start backend:

   ```bash
   cd backend
   npm install
   ts-node src/index.ts

   ```

4.
