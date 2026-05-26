/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import healthRouter from "./routes/health";
import geminiRouter from "./routes/gemini";
import customerServiceRouter from "./routes/customerService";
import supplierReconciliationRouter from "./routes/supplierReconciliation";

const app = express();

// Core standard middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets directory for compressed user images
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Routing connections
app.use("/api/health", healthRouter);
app.use("/api/gemini", geminiRouter);
app.use("/api/customer-service", customerServiceRouter);
app.use("/api/supplier-reconciliations", supplierReconciliationRouter);

export default app;
