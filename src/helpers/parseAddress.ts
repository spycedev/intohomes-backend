interface ParsedAddress {
  number?: string;
  street?: string;
  city?: string;
  postalCode?: string;
}

export function parseAddress(input: string): ParsedAddress {
  const result: ParsedAddress = {};
  let address = input.trim();

  // Canadian postal code regex (e.g., V8G 1R2)
  const postalRegex = /([A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d)/i;

  // Extract postal code if present
  const postalMatch = address.match(postalRegex);
  if (postalMatch && postalMatch[1]) {
    result.postalCode = postalMatch[1].toUpperCase();
    address = address.replace(postalMatch[0], "").trim();
  }

  // Split by commas (common in full addresses)
  const parts = address.split(",").map((p) => p.trim());

  if (parts.length === 1) {
    // Might be just street or city
    const streetRegex = /^(\d+)\s+(.*)$/; // number + street
    const match = parts[0]?.match(streetRegex);
    if (match && match[1] && match[2]) {
      result.number = match[1];
      result.street = match[2];
    } else {
      // Assume it's city only
      if (parts[0]) result.city = parts[0];
    }
  } else if (parts.length === 2) {
    // Usually "street, city"
    const streetRegex = /^(\d+)\s+(.*)$/;
    const match = parts[0]?.match(streetRegex);
    if (match && match[1] && match[2]) {
      result.number = match[1];
      result.street = match[2];
    } else {
      if (parts[0]) result.street = parts[0];
    }
    if (parts[1]) result.city = parts[1];
  } else if (parts.length >= 3) {
    // "number street, city, postal"
    const streetRegex = /^(\d+)\s+(.*)$/;
    const match = parts[0]?.match(streetRegex);
    if (match && match[1] && match[2]) {
      result.number = match[1];
      result.street = match[2];
    } else {
      if (parts[0]) result.street = parts[0];
    }
    if (parts[1]) result.city = parts[1];
    if (!result.postalCode && parts[2]) {
      result.postalCode = parts[2];
    }
  }

  return result;
}
