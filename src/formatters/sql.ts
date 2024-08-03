import { format as sqlFormatter } from "sql-formatter";

export function formatSQLCode(code: string, dialect: string): string {
  try {
    console.log("Original SQL code:", code);

    // Split SQL statements
    const statements = code.split(/(?<=;)\s*(?=\w)/);

    const formattedStatements = statements.map((statement, index) => {
      console.log(`Formatting statement ${index + 1}:`, statement);

      try {
        // Store comments with their original positions
        const comments: { index: number; comment: string }[] = [];
        let cleanStatement = statement.replace(/--.*$/gm, (match, offset) => {
          comments.push({ index: offset, comment: match });
          return `--${offset}--`; // Replace comment with a marker
        });

        // Format the statement
        let formattedStatement = sqlFormatter(cleanStatement, {
          language: dialect,
          tabWidth: 4,
          useTabs: false,
          keywordCase: "upper",
          linesBetweenQueries: 2
        });

        // Reinsert comments
        comments.forEach(({ index, comment }) => {
          formattedStatement = formattedStatement.replace(
            `--${index}--`,
            comment
          );
        });

        console.log(`Formatted statement ${index + 1}:`, formattedStatement);

        return formattedStatement;
      } catch (error) {
        console.error(`Error formatting statement ${index + 1}:`, error);
        return statement; // Return original statement on error
      }
    });

    // Join the formatted statements
    const result = formattedStatements.join("\n\n");
    console.log("Final formatted SQL code:", result);

    return result;
  } catch (error) {
    console.error("Error formatting SQL code:", error);
    return code; // Return original code on error
  }
}
