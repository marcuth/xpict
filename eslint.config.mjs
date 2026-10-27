import js from "@eslint/js"
import tseslint from "typescript-eslint"
import prettier from "eslint-plugin-prettier/recommended"
import unusedImports from "eslint-plugin-unused-imports"

export default tseslint.config(
    { ignores: ["dist/", "coverage/", "playground/", "node_modules/"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        files: ["src/**/*.ts", "__tests__/**/*.ts"],
        plugins: { "unused-imports": unusedImports },
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-function": "off",
        },
    },
)
