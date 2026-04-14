"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeVideo = exports.processYouTubeVideo = exports.disconnectComposioIntegration = exports.composioCallback = exports.connectComposioApiKey = exports.initComposioConnection = exports.readWebsite = exports.triggerRoutine = exports.executeRoutines = exports.onAgentMessageTrigger = exports.triggerAgentHeartbeat = exports.scheduledHeartbeat = exports.widgetChat = exports.chatProxy = exports.reprovisionAgent = exports.onAgentCreated = exports.onApprovalDecided = exports.onTaskAssigned = exports.archiveProject = exports.getProjects = exports.updateProject = exports.createProject = exports.getSessions = exports.completeSession = exports.logSessionTask = exports.resumeSession = exports.pauseSession = exports.createSession = exports.setAdminClaims = exports.stripeWebhook = exports.reprovisionInstance = exports.deleteInstance = exports.verifyInstanceHealth = exports.provisionInstance = exports.createCheckout = exports.createOnboardingSession = void 0;
var createOnboardingSession_1 = require("./createOnboardingSession");
Object.defineProperty(exports, "createOnboardingSession", { enumerable: true, get: function () { return createOnboardingSession_1.createOnboardingSession; } });
var createCheckout_1 = require("./createCheckout");
Object.defineProperty(exports, "createCheckout", { enumerable: true, get: function () { return createCheckout_1.createCheckout; } });
var provisionInstance_1 = require("./provisionInstance");
Object.defineProperty(exports, "provisionInstance", { enumerable: true, get: function () { return provisionInstance_1.provisionInstance; } });
Object.defineProperty(exports, "verifyInstanceHealth", { enumerable: true, get: function () { return provisionInstance_1.verifyInstanceHealth; } });
Object.defineProperty(exports, "deleteInstance", { enumerable: true, get: function () { return provisionInstance_1.deleteInstance; } });
Object.defineProperty(exports, "reprovisionInstance", { enumerable: true, get: function () { return provisionInstance_1.reprovisionInstance; } });
var stripeWebhook_1 = require("./stripeWebhook");
Object.defineProperty(exports, "stripeWebhook", { enumerable: true, get: function () { return stripeWebhook_1.stripeWebhook; } });
var adminClaims_1 = require("./adminClaims");
Object.defineProperty(exports, "setAdminClaims", { enumerable: true, get: function () { return adminClaims_1.setAdminClaims; } });
var sessionManager_1 = require("./sessionManager");
Object.defineProperty(exports, "createSession", { enumerable: true, get: function () { return sessionManager_1.createSession; } });
Object.defineProperty(exports, "pauseSession", { enumerable: true, get: function () { return sessionManager_1.pauseSession; } });
Object.defineProperty(exports, "resumeSession", { enumerable: true, get: function () { return sessionManager_1.resumeSession; } });
Object.defineProperty(exports, "logSessionTask", { enumerable: true, get: function () { return sessionManager_1.logSessionTask; } });
Object.defineProperty(exports, "completeSession", { enumerable: true, get: function () { return sessionManager_1.completeSession; } });
Object.defineProperty(exports, "getSessions", { enumerable: true, get: function () { return sessionManager_1.getSessions; } });
var projectManager_1 = require("./projectManager");
Object.defineProperty(exports, "createProject", { enumerable: true, get: function () { return projectManager_1.createProject; } });
Object.defineProperty(exports, "updateProject", { enumerable: true, get: function () { return projectManager_1.updateProject; } });
Object.defineProperty(exports, "getProjects", { enumerable: true, get: function () { return projectManager_1.getProjects; } });
Object.defineProperty(exports, "archiveProject", { enumerable: true, get: function () { return projectManager_1.archiveProject; } });
// ── Agent execution pipeline ──────────────────────────────────────────────────
var agentExecutor_1 = require("./agentExecutor");
Object.defineProperty(exports, "onTaskAssigned", { enumerable: true, get: function () { return agentExecutor_1.onTaskAssigned; } });
var approvalExecutor_1 = require("./approvalExecutor");
Object.defineProperty(exports, "onApprovalDecided", { enumerable: true, get: function () { return approvalExecutor_1.onApprovalDecided; } });
var provisionAgent_1 = require("./provisionAgent");
Object.defineProperty(exports, "onAgentCreated", { enumerable: true, get: function () { return provisionAgent_1.onAgentCreated; } });
Object.defineProperty(exports, "reprovisionAgent", { enumerable: true, get: function () { return provisionAgent_1.reprovisionAgent; } });
// ── MiniMax proxy (keeps API key server-side) ─────────────────────────────────
var minimaxProxy_1 = require("./minimaxProxy");
Object.defineProperty(exports, "chatProxy", { enumerable: true, get: function () { return minimaxProxy_1.chatProxy; } });
// ── FreemiWidget public chat endpoint ─────────────────────────────────────────
var widgetChat_1 = require("./widgetChat");
Object.defineProperty(exports, "widgetChat", { enumerable: true, get: function () { return widgetChat_1.widgetChat; } });
// ── Autonomous heartbeat (ported from Paperclip) ──────────────────────────────
var heartbeatRunner_1 = require("./heartbeatRunner");
Object.defineProperty(exports, "scheduledHeartbeat", { enumerable: true, get: function () { return heartbeatRunner_1.scheduledHeartbeat; } });
Object.defineProperty(exports, "triggerAgentHeartbeat", { enumerable: true, get: function () { return heartbeatRunner_1.triggerAgentHeartbeat; } });
Object.defineProperty(exports, "onAgentMessageTrigger", { enumerable: true, get: function () { return heartbeatRunner_1.onAgentMessageTrigger; } });
// ── Automation / routine executor ─────────────────────────────────────────────
var routineExecutor_1 = require("./routineExecutor");
Object.defineProperty(exports, "executeRoutines", { enumerable: true, get: function () { return routineExecutor_1.executeRoutines; } });
Object.defineProperty(exports, "triggerRoutine", { enumerable: true, get: function () { return routineExecutor_1.triggerRoutine; } });
// ── Onboarding helpers ────────────────────────────────────────────────────────
var readWebsite_1 = require("./readWebsite");
Object.defineProperty(exports, "readWebsite", { enumerable: true, get: function () { return readWebsite_1.readWebsite; } });
// ── Composio integration auth ─────────────────────────────────────────────────
var composioAuth_1 = require("./composioAuth");
Object.defineProperty(exports, "initComposioConnection", { enumerable: true, get: function () { return composioAuth_1.initComposioConnection; } });
Object.defineProperty(exports, "connectComposioApiKey", { enumerable: true, get: function () { return composioAuth_1.connectComposioApiKey; } });
Object.defineProperty(exports, "composioCallback", { enumerable: true, get: function () { return composioAuth_1.composioCallback; } });
Object.defineProperty(exports, "disconnectComposioIntegration", { enumerable: true, get: function () { return composioAuth_1.disconnectComposioIntegration; } });
// ── Clips: YouTube transcript → real clips pipeline ───────────────────────────
var processYouTube_1 = require("./processYouTube");
Object.defineProperty(exports, "processYouTubeVideo", { enumerable: true, get: function () { return processYouTube_1.processYouTubeVideo; } });
// ── Clips: Uploaded video → AssemblyAI transcription → real clips ─────────────
var transcribeVideo_1 = require("./transcribeVideo");
Object.defineProperty(exports, "transcribeVideo", { enumerable: true, get: function () { return transcribeVideo_1.transcribeVideo; } });
