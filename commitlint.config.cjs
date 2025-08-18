module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "docs", "chore", "refactor", "test", "ci"]],
    "scope-case": [2, "always", "upper-case"]
  }
};
