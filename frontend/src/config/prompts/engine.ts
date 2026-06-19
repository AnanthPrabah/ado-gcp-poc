
/**
 * Simple template engine that replaces {{key}} with values from a data object.
 */
export const fillTemplate = (template: string, data: Record<string, any>): string => {
    return template.replace(/{{(\w+)}}/g, (match, key) => {
        const value = data[key];
        // Handle undefined or null by returning an empty string or the match itself
        return value !== undefined ? String(value) : "";
    });
};
