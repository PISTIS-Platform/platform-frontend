export const hexToRgba = (hex: string, alpha: number) => {
    let r = 0,
        g = 0,
        b = 0;

    // Handle 3-digit hex
    if (hex.length === 3) {
        // Changed to 3 for palettes without # prefix
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        // Changed to 6 for palettes without # prefix
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 4 && hex.startsWith('#')) {
        // Handle #FFF
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7 && hex.startsWith('#')) {
        // Handle #FFFFFF
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }

    return `rgba(${r},${g},${b},${alpha})`;
};
