import * as prettier from "prettier/standalone";
import * as babelParser from "prettier/plugins/babel";
import * as estree from "prettier/plugins/estree";

export async function formatJavaScript(code: string): Promise<string> {
  try {
    const formatted = await prettier.format(code, {
      parser: "babel",
      plugins: [babelParser, estree],
      semi: true,
      tabWidth: 4,
      printWidth: 120
    });
    console.log("Formatted JS code:", formatted);
    return formatted;
  } catch (error) {
    console.error("Error formatting JS code:", error);
    throw error;
  }
}
