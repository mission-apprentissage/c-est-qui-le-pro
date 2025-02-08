import fs from "fs";
import { join } from "path";

export async function getMarkdown(filename: string) {
  const filePath = join(process.cwd(), "public", "markdown", `${filename}.md`);
  const fileContents = await fs.promises.readFile(filePath, "utf8");
  return fileContents;
}
