/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import healthRouter from "./routes/health";
import geminiRouter from "./routes/gemini";

const app = express();

// Core standard middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing connections
app.use("/api/health", healthRouter);
app.use("/api/gemini", geminiRouter);

export default app;
