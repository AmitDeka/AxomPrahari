import { Router } from "express";

const router = Router();

/**
 * Public System Info / Environment endpoint
 * GET /api/v1/system/env
 */
router.get("/env", (req, res) => {
  const env = process.env.APP_ENV || process.env.NODE_ENV || "developmentTest";
  res.status(200).json({
    status: "success",
    data: {
      env,
      environment: env,
    },
    env,
    environment: env,
  });
});

export default router;
