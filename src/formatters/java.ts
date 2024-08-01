import * as prettier from "prettier/standalone";
import * as prettierPluginJava from "prettier-plugin-java";

export async function formatJava(code: string): Promise<string> {
  return prettier.format(code, {
    parser: "java",
    plugins: [prettierPluginJava],
    semi: true,
    tabWidth: 4,
    printWidth: 120
  });
}
