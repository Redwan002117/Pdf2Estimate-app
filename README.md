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
This is the easiest way to run the app. You do NOT need to install Node.js.

**Prerequisites:**
1.  **Download & Install Docker Desktop**:
    *   **Windows**: [Download here](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe). Run the installer and strictly follow the on-screen instructions. Restart your computer after installation.
    *   **Mac**: [Download here](https://desktop.docker.com/mac/main/amd64/Docker.dmg). Drag the icon to Applications.
2.  **Start Docker**: Search for "Docker Desktop" in your start menu and open it. Wait until you see the green bar saying "Engine running".

**How to Run the App:**
1.  Download this project (Click "Code" -> "Download ZIP" and extract it, or use git clone).
2.  Open your folder in VS Code or File Explorer.
3.  **Right-click** inside the folder and verify you see files like `docker-compose.yml`.
4.  Open a terminal (Command Prompt/PowerShell) in this folder.
5.  Type the following command and hit Enter:
    ```bash
    docker-compose up --build
    ```
6.  Wait for the process to finish. It will download dependencies and start the server.
7.  Once you see "Ready in ... ms", open your browser to: **[http://localhost:6969](http://localhost:6969)**.

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
