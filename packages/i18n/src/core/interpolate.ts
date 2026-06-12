// Replace placeholders like {name} or {age} inside a template string
export function interpolate(template: string, params: Record<string, string | number>): string {
    
    // Look for patterns like {key} and replace them
    return template.replace(/\{(\w+)\}/g, (_, key: string) =>
        
        // If the key exists in params, use its value
        key in params ? String(params[key]) 
        
        // Otherwise keep the placeholder unchanged
        : `{${key}}`
    );
}
