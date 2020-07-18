module.exports = {
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  watchPathIgnorePatterns: ["<rootDir>/cdk.out/", "<rootDir>/cdk.out.test/"],
}
