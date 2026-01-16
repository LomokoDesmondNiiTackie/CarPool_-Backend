export const removeUndefinedDeep = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const result: any = {};

  for (const key in obj) {
    const value = obj[key];

    if (value === undefined) {
      continue; // Skip undefined
    }

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively clean nested objects
      result[key] = removeUndefinedDeep(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};