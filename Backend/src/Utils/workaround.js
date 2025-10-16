// Workaround for OneDrive file locking issues with MongoDB search_indexes
// This must run before any MongoDB imports

const Module = require("module");
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  // Intercept MongoDB search_indexes/update module load
  if (
    id === "./operations/search_indexes/update" ||
    id.includes("search_indexes/update")
  ) {
    try {
      return originalRequire.apply(this, arguments);
    } catch (error) {
      // Catch OneDrive file locking errors (UNKNOWN, -4094) and missing module errors (MODULE_NOT_FOUND)
      if (
        error.code === "UNKNOWN" ||
        error.errno === -4094 ||
        error.code === "MODULE_NOT_FOUND"
      ) {
        console.warn(
          "⚠️  Skipping locked/missing MongoDB search_indexes module, using fallback"
        );
        return {};
      }
      throw error;
    }
  }
  return originalRequire.apply(this, arguments);
};

module.exports = {};
