import { validateProject } from "./template-rules.mjs";

const { errors } = await validateProject();
if (errors.length) {
  for (const error of errors) {
    process.stderr.write(`- ${error}\n`);
  }
  process.exit(1);
}

process.stdout.write("Template validation passed.\n");