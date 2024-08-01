import { format as formatSQL } from "sql-formatter";

export function formatSQLCode(code: string): string {
  try {
    return formatSQL(code, {
      language: "sql",
      tabWidth: 4,
      useTabs: false,
      keywordCase: "upper",
      linesBetweenQueries: 2
      // maxColumnLength: 80 // 이 속성을 제거
    });
  } catch (error) {
    console.error("Error formatting SQL code:", error);
    throw error;
  }
}
