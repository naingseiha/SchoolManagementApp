"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🔧 Registering AUTH routes...");
// Public routes
router.post("/login", (req, res, next) => {
    console.log("📥 POST /api/auth/login called");
    next();
}, auth_controller_1.login);
router.post("/refresh", (req, res, next) => {
    console.log("📥 POST /api/auth/refresh called");
    next();
}, auth_controller_1.refreshToken);
// Protected routes
router.get("/me", (req, res, next) => {
    console.log("📥 GET /api/auth/me called");
    next();
}, auth_middleware_1.authMiddleware, auth_controller_1.getCurrentUser);
console.log("✅ Auth routes registered:");
console.log("  - POST /api/auth/login");
console.log("  - POST /api/auth/refresh");
console.log("  - GET  /api/auth/me");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
exports.default = router;
