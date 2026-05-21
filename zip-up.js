const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT_FOLDER = __dirname;
const ROOT_NAME = path.basename(ROOT_FOLDER);
const PARENT_FOLDER = path.dirname(ROOT_FOLDER);

const OUTPUT_ZIP = path.join(PARENT_FOLDER, `${ROOT_NAME}_clean.zip`);

const EXCLUDES = [
    "*.idea/*",
    "*.vscode/*",
    "*node_modules/*",
    "*.venv/*",
    '*.png',
    "*venv/*",
    "*env/*",
    "*__pycache__/*",
    "*.git/*",
    "*.next/*",
    "*dist/*",
    "*build/*",
    "*.cache/*",
    "*.pytest_cache/*",
    "*.mypy_cache/*",
    "*.turbo/*",
    "*coverage/*",
    "*.DS_Store",
    "*Thumbs.db",
    "*.pyc",
    "*.pyo",
    "*.log",
    "*zip-up.js",
];

function zipRootFolder() {
    if (fs.existsSync(OUTPUT_ZIP)) {
        fs.unlinkSync(OUTPUT_ZIP);
    }

    const args = [
        "-r",
        OUTPUT_ZIP,
        ROOT_NAME,
        ...EXCLUDES.flatMap((pattern) => ["-x", pattern]),
    ];

    console.log("Creating clean zip...");
    console.log(`Source: ${ROOT_FOLDER}`);
    console.log(`Output: ${OUTPUT_ZIP}`);

    execFileSync("zip", args, {
        cwd: PARENT_FOLDER,
        stdio: "inherit",
    });

    console.log("\nDone.");
}

zipRootFolder();