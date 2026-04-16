"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardHaltError = exports.processContext = exports.ActionTimeoutError = exports.ActionEscalatedError = exports.ActionDeniedError = exports.StatisError = exports.StatisClient = void 0;
var client_1 = require("./client");
Object.defineProperty(exports, "StatisClient", { enumerable: true, get: function () { return client_1.StatisClient; } });
var types_1 = require("./types");
Object.defineProperty(exports, "StatisError", { enumerable: true, get: function () { return types_1.StatisError; } });
Object.defineProperty(exports, "ActionDeniedError", { enumerable: true, get: function () { return types_1.ActionDeniedError; } });
Object.defineProperty(exports, "ActionEscalatedError", { enumerable: true, get: function () { return types_1.ActionEscalatedError; } });
Object.defineProperty(exports, "ActionTimeoutError", { enumerable: true, get: function () { return types_1.ActionTimeoutError; } });
// Re-export statis-kit context processing (offline, zero-auth)
var statis_kit_1 = require("statis-kit");
Object.defineProperty(exports, "processContext", { enumerable: true, get: function () { return statis_kit_1.process; } });
Object.defineProperty(exports, "GuardHaltError", { enumerable: true, get: function () { return statis_kit_1.GuardHaltError; } });
//# sourceMappingURL=index.js.map