<!-- Animated Header -->
<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&weight=900&size=50&duration=3000&pause=1000&color=2563EB&center=true&vCenter=true&width=600&lines=Pdf2Estimate+Pro;AI+Repair+Insights;Instant+CSV+Analysis" alt="Typing SVG" />
  
  <p align="center">
    <b>The Ultimate AI-Powered Repair Estimate Processor</b>
  </p>

  <!-- Badges -->
  <p align="center">
    <a href="https://github.com/Redwan002117/pdf2estimate-app/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/Redwan002117/pdf2estimate-app/docker-publish.yml?style=for-the-badge&logo=github&label=BUILD" alt="Build Status" />
    </a>
    <img src="https://img.shields.io/github/package-json/v/Redwan002117/pdf2estimate-app?style=for-the-badge&color=blueviolet" alt="Version" />
    <img src="https://img.shields.io/badge/DOCKER-READY-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Ready" />
    <img src="https://img.shields.io/badge/AI-GEMINI%20PRO-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="AI Model" />
    <img src="https://img.shields.io/github/license/Redwan002117/pdf2estimate-app?style=for-the-badge&color=green" alt="License" />
  </p>
</div>

---

## 📑 Table of Contents
- [⚡ System Architecture](#-system-architecture)
- [✨ Mission Control Features](#-mission-control-features)
- [🖥️ Visual Interface Guide](#-visual-interface-guide)
- [🚀 Deployment Protocols](#-deployment-protocols)
- [⚙️ Configuration Matrix](#-configuration-matrix)
- [🛡️ License](#-license)

---

## ⚡ System Architecture

<div align="center">
  <img src="https://raw.githubusercontent.com/Redwan002117/pdf2estimate-app/main/public/assets/architecture.svg" width="100%" alt="System Architecture Diagram" />
</div>

## ✨ Mission Control Features

| Feature | Description | Status |
| :--- | :--- | :---: |
| **📄 PDF Extraction** | Instantly convert messy PDF estimates into structured data. | ✅ |
| **🤖 Magic Wand** | Auto-research property specs (SqFt, Year Built) via Google Search. | ✅ |
| **📊 Smart Format** | Clean, editable table view with total calculations. | ✅ |
| **🐳 Dockerized** | One-click deployment on any server (CasaOS/Portainer). | ✅ |
| **🖨️ Print Ready** | Professional print layout with custom logo support. | ✅ |

---

## 🖥️ Visual Interface Guide

### 1. The Command Center
> Drag and drop functionality with a clean, minimal interface. Supports PDF, PNG, and JPEG.

### 2. AI Extraction Engine
> Watch as the Gemini AI scans your document line-by-line, extracting descriptions, quantities, and costs with high precision.

### 3. Property Intelligence
> Click the **Magic Wand** 🪄 to activate the AI Agent. It searches real estate databases to find:
> -   🏠 **Square Footage**
> -   📅 **Year Built**
> -   🛏️ **Bed/Bath Count**

### 4. Final Output
> A beautifully formatted, print-ready estimate that you can save as PDF or print directly.

---

## 🚀 Deployment Protocols

<details open>
<summary><b>PROTOCOL 1: Docker Compose (Default)</b></summary>
<br>

Run strictly from the command line:

```bash
# 1. Pull Latest Image
docker compose pull

# 2. Deploy
docker compose up -d

# 3. Access
# http://localhost:6969
```
</details>

<details>
<summary><b>PROTOCOL 2: CasaOS (Home Server)</b></summary>
<br>

**Import via UI:**
1.  Open **CasaOS Dashboard**.
2.  Click `+` -> **Install Custom App**.
3.  Click **Import** (Top Right).
4.  Paste contents of: [`docker-compose.yml`](https://github.com/Redwan002117/pdf2estimate-app/blob/main/docker-compose.yml)
5.  Click **Install**.

**Terminal Install:**
```bash
# SSH into your CasaOS server
mkdir -p /DATA/AppData/pdf2estimate-app
cd /DATA/AppData/pdf2estimate-app

# Download Config
wget https://raw.githubusercontent.com/Redwan002117/pdf2estimate-app/main/docker-compose.yml

# Ignite
docker compose up -d
```
</details>

<details>
<summary><b>PROTOCOL 3: Local Dev (Source Code)</b></summary>
<br>

For development only:

```bash
# Clone
git clone https://github.com/Redwan002117/pdf2estimate-app.git
cd pdf2estimate-app

# Install & Run
npm install
npm run dev
```
</details>

---

## ⚙️ Configuration Matrix

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_GEMINI_API_KEY` | Google Gemini API Key (Required for AI features). | `change_me` |
| `PORT` | Local port binding. | `6969` |

> **Pro Tip:** You can set the API Key directly in the UI (Settings Gear Icon) if you don't want to use environment variables.

---

## 🛡️ License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

<div align="center">
  <sub>Built with ❤️ by Redwan • Powered by Gemini AI</sub>
</div>
