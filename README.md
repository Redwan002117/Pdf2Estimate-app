# 🛠️ RepairBase Pro

**RepairBase Pro** is a powerful React application designed to streamline the creation of repair estimates. It leverages AI to extract data from PDFs/Images and automatically research property details.

## ✨ Features

-   **🤖 AI Extraction**: Upload PDF or Image estimates to automatically extract line items.
-   **🪄 Property Auto-Fill**: "Magic Wand" feature uses **AI agents** to research property facts (Year Built, Square Footage, etc.) from real estate sources.
-   **📄 Print-Ready**: Professional print layout with page breaks, totals, and disclaimer.
-   **🐳 Dockerized**: Easy deployment with Docker and CasaOS support.

## 🚀 Installation Guide

### Option 1: Docker (Recommended) 🐳
This is the easiest way to run the app. You do **NOT** need to install Node.js.

**Prerequisites:**
1.  **Download & Install Docker Desktop**:
    *   **🪟 Windows**: [Download here](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe). Run the installer and strictly follow the on-screen instructions. Restart your computer after installation.
    *   **🍎 Mac**: [Download here](https://desktop.docker.com/mac/main/amd64/Docker.dmg). Drag the icon to Applications.
2.  **Start Docker**: Search for "Docker Desktop" in your start menu and open it. Wait until you see the green bar saying "Engine running".

**How to Run the App:**
1.  📥 **Download** this project (Click "Code" -> "Download ZIP" and extract it, or use git clone).
2.  📂 **Open** your folder in VS Code or File Explorer.
3.  ✅ **Right-click** inside the folder and verify you see files like `docker-compose.yml`.
4.  💻 **Open a terminal** (Command Prompt/PowerShell) in this folder.
5.  ⌨️ **Type** the following command and hit Enter:
    ```bash
    docker compose up --build
    ```
    *(Note: If that doesn't work, try `docker-compose up --build`)*
6.  ⏳ **Wait** for the process to finish. It will download dependencies and start the server.
7.  🌐 **Success!** Once you see "Ready in ... ms", open your browser to: **[http://localhost:6969](http://localhost:6969)**.

### Option 2: CasaOS (Home Server) 🏠

**Easy Import:**
1.  Open your **CasaOS Dashboard**.
2.  Click the `+` button to install a new app.
3.  Select **"Custom Install"** (or "Docker Compose").
4.  Click **"Import"** (top right corner usually).
5.  📋 **Paste** the contents of the [`docker-compose.yml`](https://github.com/Redwan002117/repair-base-app/blob/main/docker-compose.yml) file from this repository.
    *   *Alternatively, download the `docker-compose.yml` file and upload it.*
6.  CasaOS will automatically parse the settings (Icon, Name, Port 6969).
7.  Click **"Install"**.
8.  🎉 Once done, click the **RepairBase Pro** icon on your dashboard to open it.

### Option 3: CasaOS (Via Terminal / SSH) 💻
If the UI import fails, you can install it via the terminal.

1.  **Connect to your CasaOS/Server** via SSH or open the built-in terminal.
2.  **Create a folder**:
    ```bash
    mkdir -p ~/repair-base-app
    cd ~/repair-base-app
    ```
3.  **Download configuration**:
    ```bash
    wget https://raw.githubusercontent.com/Redwan002117/repair-base-app/main/docker-compose.yml
    ```
4.  **Run the app**:
    ```bash
    docker compose up -d
    ```
    *(Note: If you get "command not found", try `docker-compose up -d`)*
5.  It will appear in your CasaOS dashboard automatically (managed by Docker).

---

## 🔄 Updating the App

**Option 1: Windows Script (Easiest)**
1.  Double-click `update_app.bat` in the folder.
2.  It will pull changes and restart Docker automatically.

**Option 2: Manual Update**
```bash
git pull
docker compose up --build -d
```

---

### Option 3: Local Development (For Developers) 👨‍💻
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
