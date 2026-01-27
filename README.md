# RepairBase Pro

RepairBase Pro is a powerful React application designed to streamline the creation of repair estimates. It leverages AI to extract data from PDFs/Images and automatically research property details.

## Features

-   **AI Extraction**: Automatically extracts repair items and costs from PDF or Image estimates using Gemini AI.
-   **Auto-Fill Property Info**: Automatically fetches property characteristics (Bedrooms, Baths, Sqft, Year Built) given an address.
-   **PDF Generation**: Generates professional RepairBase PDF reports ready for printing.
-   **Smart Layout**: Optimizes layout for printing, ensuring headers/footers are correctly positioned.
-   **Security**: Your API Key is stored locally in your browser, not on a server.

## Installation Guide

### Option 1: Docker (Recommended)
This is the easiest way to run the app without installing Node.js or dealing with dependencies.

**Prerequisites:**
1.  **Install Docker Desktop**:
    *   **Windows**: Download from [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/). Run the installer and restart your computer if asked.
    *   **Mac/Linux**: Install Docker Desktop for your OS.
2.  **Verify Installation**: Open a terminal (Command Prompt or PowerShell) and run:
    ```bash
    docker --version
    ```
    If you see a version number, you are ready.

**Steps to Run:**
1.  **Clone or Download** this repository to your computer.
2.  Open your terminal in the project folder.
3.  **Start the App**:
    ```bash
    docker-compose up --build
    ```
    *This might take a few minutes the first time.*
4.  **Access the App**:
    Open your browser and go to: **[http://localhost:6969](http://localhost:6969)**.

**Updating the App (Docker):**
To get the latest version from GitHub:
1.  **Windows**: Double-click the `update_app.bat` file in the project folder.
2.  **Linux/Mac**: Run `./update_app.sh` in the terminal.

---

### Option 2: Local Development (For Developers)
Use this if you want to modify the code or run it without Docker.

**Prerequisites:**
1.  **Install Node.js**: Download and install the "LTS" version from [nodejs.org](https://nodejs.org/).
2.  **Verify Installation**: Run `node -v` and `npm -v` in your terminal.

**Steps to Run:**
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Redwan002117/repair-base-app.git
    cd repair-base-app
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
4.  **Access the App**:
    The terminal will show a local URL (usually `http://localhost:5173`). Open that in your browser.

## Configuration

-   **API Key**: Click the "Settings" (gear icon) in the top right to enter your Gemini API Key. This key is required for the AI features to work.
-   **Company Logo**: You can upload your own logo in the settings menu, which will appear on the generated PDF.

## Usage

1.  **Upload**: Drag and drop a PDF estimate or image.
2.  **Review**: Check the extracted data.
3.  **Enhance**: Enter the property address and click the "Magic Wand" icon to auto-fill property specs.
4.  **Print**: Click "Print Estimate" to generate the final PDF.
