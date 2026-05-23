/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      time: new Date().toISOString(),
    },
    message: "System healthy",
    error: null
  });
});

export default router;
