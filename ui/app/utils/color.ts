interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

interface GradientStop {
  position: number;
  color: ColorRGB;
}

function getColorAtPosition(gradientStr: string, position: number): string {
  // Position should be between 0 and 1
  position = Math.max(0, Math.min(1, position));

  // Parse the gradient stops
  const stops: GradientStop[] = parseGradient(gradientStr);

  // Find the two stops that our position falls between
  let leftStop: GradientStop = stops[0];
  let rightStop: GradientStop = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (stops[i].position <= position && stops[i + 1].position >= position) {
      leftStop = stops[i];
      rightStop = stops[i + 1];
      break;
    }
  }

  // Calculate the interpolation factor between the two stops
  const range: number = rightStop.position - leftStop.position;
  const factor: number = range === 0 ? 0 : (position - leftStop.position) / range;

  // Interpolate RGB values
  const r: number = Math.round(leftStop.color.r + factor * (rightStop.color.r - leftStop.color.r));
  const g: number = Math.round(leftStop.color.g + factor * (rightStop.color.g - leftStop.color.g));
  const b: number = Math.round(leftStop.color.b + factor * (rightStop.color.b - leftStop.color.b));

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts an RGB color to a hex code
 * @param rgb RGB color object
 * @returns Hex color code
 */
function rgbToHex(rgb: ColorRGB): string {
  return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

/**
 * Parses a CSS gradient string into a list of gradient stops
 * @param gradientStr CSS linear-gradient string
 * @returns Array of gradient stops
 */
function parseGradient(gradientStr: string): GradientStop[] {
  const stops: GradientStop[] = [];

  // Extract the direction and stops
  const match = gradientStr.match(/linear-gradient\((.*)\)/);
  if (!match) {
    throw new Error("Invalid gradient string");
  }

  const parts = match[1].split(",");

  // Check if the first part is a direction
  let startIndex = 0;
  if (parts[0].includes("to ") || parts[0].includes("deg")) {
    startIndex = 1;
  }

  // Join the color stops back together
  const stopsStr = parts.slice(startIndex).join(",").trim();

  // Split by commas, but not within rgb/rgba functions
  const stopParts = stopsStr.split(/,(?![^(]*\))/);

  stopParts.forEach((part, index) => {
    part = part.trim();

    // Extract color and position
    let colorPart: string;
    let positionPart: string | null = null;

    // Check for percentage
    const percentMatch = part.match(/(.*?)(\s+\d+%)/);
    if (percentMatch) {
      colorPart = percentMatch[1].trim();
      positionPart = percentMatch[2].trim();
    } else {
      colorPart = part;
    }

    // Calculate position
    let position: number;
    if (positionPart) {
      position = parseFloat(positionPart) / 100;
    } else {
      // If no position is specified, distribute evenly
      position = index === 0 ? 0 : index === stopParts.length - 1 ? 1 : index / (stopParts.length - 1);
    }

    const color = parseColor(colorPart);
    stops.push({ position, color });
  });

  return stops;
}

/**
 * Parses a CSS color string into RGB components
 * @param colorStr CSS color string
 * @returns RGB color object
 */
function parseColor(colorStr: string): ColorRGB {
  // Handle hex colors
  if (colorStr.startsWith("#")) {
    const hex = colorStr.substring(1);
    // Handle shorthand hex (#RGB)
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    // Handle regular hex (#RRGGBB)
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
  }

  // Handle rgb/rgba
  if (colorStr.startsWith("rgb")) {
    const matches = colorStr.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (matches) {
      return {
        r: parseInt(matches[1], 10),
        g: parseInt(matches[2], 10),
        b: parseInt(matches[3], 10),
      };
    }
  }

  // Default fallback
  console.warn(`Could not parse color: ${colorStr}`);
  return { r: 0, g: 0, b: 0 };
}

// Export the functions for use in other modules
export { getColorAtPosition, rgbToHex, parseGradient, parseColor };
