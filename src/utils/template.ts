/**
 * Minimal string templating for content files.
 * Replaces "{{key}}" placeholders with values from vars; unknown keys are left as-is
 * so a typo stays visible instead of silently rendering an empty string.
 */
export function interpolate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => vars[key] ?? match);
}

/**
 * Recursively interpolate every string of a JSON-like content object.
 */
export function interpolateContent<T>(content: T, vars: Record<string, string>): T {
    if (typeof content === 'string') return interpolate(content, vars) as T;
    if (Array.isArray(content)) return content.map((item) => interpolateContent(item, vars)) as T;
    if (content !== null && typeof content === 'object') {
        return Object.fromEntries(
            Object.entries(content).map(([key, value]) => [key, interpolateContent(value, vars)])
        ) as T;
    }
    return content;
}
