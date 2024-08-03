import * as prettier from "prettier/standalone";
import parserJava from "prettier-plugin-java";

export async function formatJava(code: string): Promise<string> {
  console.log("Input Java code:", code);

  try {
    const formatted = await prettier.format(code, {
      parser: "java",
      plugins: [parserJava],
      semi: true,
      tabWidth: 4,
      printWidth: 120
    });

    console.log("Formatted Java code:", formatted);
    return formatted;
  } catch (error) {
    console.error("Error formatting Java code:", error);
    throw error;
  }
}
