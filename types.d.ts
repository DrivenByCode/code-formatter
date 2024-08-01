declare module 'prettier-plugin-java' {
    const plugin: any;
    export = plugin;
}

declare module 'sql-formatter' {
    export function format(sql: string, config?: any): string;
}