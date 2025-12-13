import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateOpenAPIDocument } from "@/api-docs/openAPIDocumentGenerator";

const document = generateOpenAPIDocument();
const outputPath = join(process.cwd(), "openapi.json");

writeFileSync(outputPath, JSON.stringify(document, null, 2), "utf-8");

console.log(`✓ OpenAPI specification exported to ${outputPath}`);
