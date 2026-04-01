export function validateAgainstSchema(schema, value, currentPath = schema.title || "$") {
  const errors = [];

  function visit(node, data, location) {
    if (!node) {
      return;
    }

    if (node.type === "object") {
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        errors.push(`${location} should be an object.`);
        return;
      }

      for (const key of node.required || []) {
        if (!(key in data)) {
          errors.push(`${location}.${key} is required.`);
        }
      }

      for (const [key, childSchema] of Object.entries(node.properties || {})) {
        if (key in data) {
          visit(childSchema, data[key], `${location}.${key}`);
        }
      }
      return;
    }

    if (node.type === "array") {
      if (!Array.isArray(data)) {
        errors.push(`${location} should be an array.`);
        return;
      }

      data.forEach((item, index) => {
        visit(node.items, item, `${location}[${index}]`);
      });
      return;
    }

    if (node.type === "string") {
      if (typeof data !== "string") {
        errors.push(`${location} should be a string.`);
        return;
      }
      if (node.minLength && data.length < node.minLength) {
        errors.push(`${location} should be at least ${node.minLength} characters.`);
      }
      if (node.enum && !node.enum.includes(data)) {
        errors.push(`${location} must be one of: ${node.enum.join(", ")}.`);
      }
    }
  }

  visit(schema, value, currentPath);
  return errors;
}