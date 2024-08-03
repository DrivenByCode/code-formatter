import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  Editor,
  MarkdownView,
  Notice
} from "obsidian";

// const isProduction = process.env.NODE_ENV === "production";

const isProduction = false;

// 프로덕션 환경에서 콘솔 로그를 비활성화
if (isProduction) {
  console.warn = console.error = console.log = function () {};
}

interface FormatterPluginSettings {
  formatOnSave: boolean;
  formatInterval: number;
  supportedLanguages: string[];
  sqlDialect: string;
}

const DEFAULT_SETTINGS: FormatterPluginSettings = {
  formatOnSave: false,
  formatInterval: 30,
  supportedLanguages: ["java", "sql", "javascript"],
  sqlDialect: "sql"
};

export default class FormatterPlugin extends Plugin {
  settings: FormatterPluginSettings = DEFAULT_SETTINGS;
  private formatTimer: NodeJS.Timeout | null = null;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new FormatterSettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on(
        "editor-change",
        this.debouncedFormatCodeBlocks.bind(this)
      )
    );

    this.addCommand({
      id: "format-code-blocks",
      name: "Format Code Blocks",
      editorCallback: async (editor: Editor) =>
        await this.formatCodeBlocks(editor)
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.debouncedFormatCodeBlocks();
  }

  debouncedFormatCodeBlocks() {
    if (this.formatTimer) {
      clearTimeout(this.formatTimer);
    }

    if (this.settings.formatOnSave) {
      this.formatTimer = setTimeout(() => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
          this.formatCodeBlocks(activeView.editor);
          new Notice("Code blocks formatted");
        }
      }, this.settings.formatInterval * 1000);
    }
  }

  async formatCodeBlocks(editor: Editor) {
    const docText = editor.getValue();
    const codeBlocks = this.extractCodeBlocks(docText);
    let formattedText = docText;

    for (const block of codeBlocks) {
      if (this.settings.supportedLanguages.includes(block.language)) {
        try {
          const formatted = await this.formatCode(block.code, block.language);
          formattedText = formattedText.replace(
            block.original,
            `\`\`\`${block.language}\n${formatted}\n\`\`\``
          );
        } catch (error) {
          console.error(`Error formatting ${block.language} code:`, error);
        }
      }
    }

    if (formattedText !== docText) {
      editor.setValue(formattedText);
    }
  }

  extractCodeBlocks(
    text: string
  ): Array<{ language: string; code: string; original: string }> {
    const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1].toLowerCase(),
        code: match[2],
        original: match[0]
      });
    }

    return blocks;
  }

  async formatCode(code: string, language: string): Promise<string> {
    if (language === "java") {
      return import("./formatters/java").then((module) =>
        module.formatJava(code)
      );
    } else if (language === "sql") {
      return import("./formatters/sql").then((module) =>
        module.formatSQLCode(code, this.settings.sqlDialect)
      );
    } else if (language === "javascript") {
      return import("./formatters/javascript").then((module) =>
        module.formatJavaScript(code)
      );
    }
    return code;
  }
}

class FormatterSettingTab extends PluginSettingTab {
  plugin: FormatterPlugin;

  constructor(app: App, plugin: FormatterPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Formatter Settings" });

    new Setting(containerEl)
      .setName("Format on Save")
      .setDesc("Automatically format code blocks")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.formatOnSave)
          .onChange(async (value) => {
            this.plugin.settings.formatOnSave = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Format Interval")
      .setDesc("Interval in seconds between automatic formatting (if enabled)")
      .addSlider((slider) =>
        slider
          .setLimits(5, 60, 5)
          .setValue(this.plugin.settings.formatInterval)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.formatInterval = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Supported Languages")
      .setDesc("Select languages to format")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("java", "Java")
          .addOption("sql", "SQL")
          .addOption("javascript", "JavaScript")
          .addOption("java,sql", "Java and SQL")
          .addOption("java,javascript", "Java and JavaScript")
          .addOption("sql,javascript", "SQL and JavaScript")
          .addOption("java,sql,javascript", "Java, SQL, and JavaScript")
          .setValue(this.plugin.settings.supportedLanguages.join(","))
          .onChange(async (value) => {
            this.plugin.settings.supportedLanguages = value.split(",");
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("SQL Dialect")
      .setDesc("Select SQL dialect to format")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("sql", "Standard SQL")
          .addOption("bigquery", "GCP BigQuery")
          .addOption("db2", "IBM DB2")
          .addOption("db2i", "IBM DB2i (experimental)")
          .addOption("hive", "Apache Hive")
          .addOption("mariadb", "MariaDB")
          .addOption("mysql", "MySQL")
          .addOption("tidb", "TiDB")
          .addOption("n1ql", "Couchbase N1QL")
          .addOption("plsql", "Oracle PL/SQL")
          .addOption("postgresql", "PostgreSQL")
          .addOption("redshift", "Amazon Redshift")
          .addOption("singlestoredb", "SingleStoreDB")
          .addOption("snowflake", "Snowflake")
          .addOption("spark", "Spark")
          .addOption("sqlite", "SQLite")
          .addOption("transactsql", "SQL Server Transact-SQL")
          .addOption("trino", "Trino (Presto)")
          .setValue(this.plugin.settings.sqlDialect)
          .onChange(async (value) => {
            this.plugin.settings.sqlDialect = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
