# RepairBase Pro

RepairBase Pro is a powerful React application designed to streamline the creation of repair estimates. It leverages AI to extract data from PDFs/Images and automatically research property details.

## Features

-   **AI Extraction**: Automatically extracts repair items and costs from PDF or Image estimates using Gemini AI.
-   **Auto-Fill Property Info**: Automatically fetches property characteristics (Bedrooms, Baths, Sqft, Year Built) given an address.
-   **PDF Generation**: Generates professional RepairBase PDF reports ready for printing.
-   **Smart Layout**: Optimizes layout for printing, ensuring headers/footers are correctly positioned.
-   **Security**: Your API Key is stored locally in your browser, not on a server.

## Installation

### Prerequisites
-   Node.js (v18+)
-   Docker (Optional, for containerized run)
-   Gemini API Key (Get one from Google AI Studio)

### Local Development
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

### Docker
1.  Build and run the container:
    ```bash
    docker-compose up --build
    ```
2.  Access the app at `http://localhost:6969`.

## Usage

1.  **Upload**: Drag and drop a PDF estimate or image.
2.  **Review**: Check the extracted data.
3.  **Enhance**: Enter the property address and click the "Magic Wand" to auto-fill property specs.
4.  **Print**: Click "Print Estimate" to generate the final PDF.

## Configuration

-   **API Key**: Click the "Settings" (gear icon) in the top right to enter your Gemini API Key.
