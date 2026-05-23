# AI Generation & Architectural Rules (OpsPilot ERP)

This document outlines the strict architectural contracts, owner matrices, and instructions for any AI tools (e.g., AI Studio, Codex) collaborating on this codebase.

## 1. Multi-AI Collaboration Matrix & Owners

To allow seamless parallel development and prevent overlapping file modifications, the repository is strictly divided by owner-roles:

| Tool Client | Core Responsibilities | Exclusive Directory Ownership | Shared Interfaces / Assets |
| :--- | :--- | :--- | :--- |
| **AI Studio** | • Frontend Views & Layouts<br>• User Interactions & Animations (`motion`)<br>• Local Component Styling (Tailwind)<br>• Micro-State Sandbox & Mock Databases | `/frontend/**/*`<br>`/index.html`<br>`/vite.config.ts` | • `/shared/types/index.ts`<br>• `.env.example`<br>• `/metadata.json` |
| **Codex** | • Backend API Routing & Controllers<br>• Databases, Schemas & Migrations<br>• Identity, Role Auth & Permissions<br>• Production Deployment & Configs | `/backend/**/*`<br>`/package.json`<br>`/tsconfig.json` | • `/shared/types/index.ts`<br>• `.env.example` |

---

## 2. Front-End Guidelines for AI Studio (`/frontend`)

- **Strict Path Aliases:**
  - Always use `@/` to import files within the frontend context (e.g., `import Sidebar from "@/components/sidebar/Sidebar"`).
  - Always use `@shared/` to reference shared types (e.g., `import { ApiResponse } from "@shared/types"`).
- **Direct Backend Fetches are Prohibited:**
  - Never write raw `fetch` or `axios` calls with inline paths inside client page views.
  - All networking must be isolated within client API files in `frontend/src/api/` (e.g., `dashboard.ts`, `sales.ts`, `products.ts`, `finance.ts`).
- **Sandbox Fallback Mode (Crucial for AI Studio):**
  - To prevent UI crashes during offline editing or before Codex completes database schemas: **every** API request exported inside `frontend/src/api/*.ts` must pass a high-fidelity `mockData` object directly inside the custom options parameter of the `request()` call.
  - If the server has not implemented the endpoint yet (returning 404/500/502) or if network connectivity is missing, the `request()` layer will automatically log a warning and return the mock dataset wrapped cleanly inside the standardized `ApiResponse<T>` contract.
- **No Secret Environment Variables:**
  - Client code may only access variables prefixed with `VITE_` using `import.meta.env`.

---

## 3. Back-End Guidelines for Codex (`/backend`)

- **Isolated Server Controllers:**
  - Server endpoints inside `/backend/src/routes` must delegate core logic to controllers in `/backend/src/controllers` and services in `/backend/src/services`.
- **Zero Client-Side Imports:**
  - The backend code must never import UI files, layout routines, or React components from `/frontend` or vice versa.
- **Standardized API Contract:**
  - All controller outputs must map directly to the unified `ApiResponse<T>` contract declared in `/shared/types`.
  
  ```ts
  export interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    message: string;
    error: string | null;
  }
  ```

---

## 4. Shared Contract Layer (`/shared`)

- **Enums & Pure Types:**
  - Only export standard `enum` and pure JSON-serializable `interface` definitions.
  - Keep types simple, serialize-friendly, and free of browser-specific (e.g., `window`) or Node-specific (e.g., `Buffer`) dependencies. Both AI tools must respect standard Node type-stripping when updating shared types.

---

## 5. Development and Build Integration

- **Vite Dev Middleware Mode:**
  - In development, the backend server starts a Vite middleware instance relative to the `frontend` root to enable unified previewing on port `3000`.
- **Root Scripts Protocol:**
  - Avoid altering scripts in root `package.json` unless keeping correct ESBuild compilations in sync.
