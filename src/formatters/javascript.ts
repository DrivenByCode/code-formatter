import * as prettier from "prettier/standalone";
import * as prettierPluginBabel from "prettier/parser-babel";

export async function formatJavaScript(code: string): Promise<string> {
  return prettier.format(code, {
    parser: "babel",
    plugins: [prettierPluginBabel],
    semi: true,
    tabWidth: 4,
    printWidth: 120
  });
}
