# Muv In – Decentralized Hotel Booking Platform

## 🧭 Overview

**Muv In** is a decentralized hotel booking application built on the Internet Computer Protocol (ICP). It enables users to seamlessly discover, book, and manage accommodation options using blockchain technology. The backend smart contracts are developed in Motoko, while the frontend is crafted using React and TypeScript for a modern and intuitive user interface.

---

## 🚀 Features

* Fully decentralized hotel listing and booking
* Blockchain-backed data integrity and tamper-proof records
* Smart contract logic written in Motoko
* Modern, responsive frontend in React + TypeScript
* Extensible architecture for future enhancements

---

## 🧱 Tech Stack

* **Backend**: Motoko (canisters), DFX SDK
* **Frontend**: React + TypeScript
* **Package Management**: npm
* **Canister Communication**: @dfinity/agent
* **Version Control**: Git

---

## 📁 Project Structure

```
muv_in/
├── dfx.json                     # ICP project configuration
├── src/
│   ├── muv_in_backend/          # Motoko backend logic
│   │   └── main.mo              # Smart contract code
│   └── muv_in_frontend/         # React frontend
│       ├── public/
│       ├── src/
│       │   ├── App.tsx
│       │   └── index.tsx
│       ├── package.json
│       └── tsconfig.json
├── declarations/               # Auto-generated bindings
│   └── muv_in_backend/
└── README.md
```

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/muv_in.git
cd muv_in
```

### 2. Install DFX SDK

```bash
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

### 3. Install Node.js (if not installed)

Download from: [https://nodejs.org](https://nodejs.org) (use LTS version)

---

## ⚙️ Running the Application

### 1. Start Local ICP Environment

```bash
dfx start --background
```

### 2. Deploy the Backend Canister

```bash
dfx deploy
```

### 3. Create and Start the Frontend

```bash
cd src
npx create-react-app muv_in_frontend --template typescript --use-npm
cd muv_in_frontend
npm start
```

Visit `http://localhost:3000` to view the frontend.

---

## 🔗 Connect Frontend to ICP Backend

Use `@dfinity/agent` and generated bindings:

```ts
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '../../../declarations/muv_in_backend';

const agent = new HttpAgent({ host: "http://localhost:4943" });
const canisterId = "<your-canister-id>";
const actor = Actor.createActor(idlFactory, { agent, canisterId });
```

---

## 📌 Roadmap

* ✅ MVP with decentralized booking logic
* 🚧 Add hotel rating & review system
* 🚧 Integrate Internet Identity for login
* 🚧 TailwindCSS UI overhaul
* 🚧 Geo-filtering and search features

---

## 👤 Team

**Shema Collins**

**Muhangi Elioda**

**Ainamaani Douglas Bagambe**


---

## 📄 License

MIT License. See `LICENSE` file for details.
