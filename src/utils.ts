/**
 * URL Organizer Utility Functions
 */

// Helper to format/validate URL input
export function formatUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  
  // Checking if it already has a protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Check if it's an email/local path, otherwise prefix with https://
  return `https://${trimmed}`;
}

// Get clean hostname for display from a full URL
export function getHostname(urlStr: string): string {
  try {
    const url = new URL(formatUrl(urlStr));
    return url.hostname.replace(/^www\./i, "");
  } catch (error) {
    return urlStr || "invalid-url";
  }
}

// Get URL for Google's favicon service
export function getFaviconUrl(urlStr: string): string {
  try {
    const formatted = formatUrl(urlStr);
    const domain = new URL(formatted).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch (e) {
    // Return standard generic globe favicon
    return "";
  }
}

// Check if a URL is valid
export function isValidUrl(urlStr: string): boolean {
  if (!urlStr) return false;
  const formatted = formatUrl(urlStr);
  try {
    new URL(formatted);
    // Simple regex to check if it has a period, representing a domain
    return formatted.includes(".");
  } catch (e) {
    return false;
  }
}

// Predefined colors for custom categories
export interface ColorOption {
  bg: string;
  text: string;
  border: string;
  dot: string;
  hover: string;
  ring: string;
  label: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  {
    label: "Indigo",
    bg: "bg-indigo-50/50 hover:bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
    dot: "bg-indigo-500",
    hover: "hover:border-indigo-200",
    ring: "focus:ring-indigo-500",
  },
  {
    label: "Esmeralda",
    bg: "bg-emerald-50/50 hover:bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
    hover: "hover:border-emerald-200",
    ring: "focus:ring-emerald-500",
  },
  {
    label: "Cielo",
    bg: "bg-sky-50/50 hover:bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-100",
    dot: "bg-sky-500",
    hover: "hover:border-sky-200",
    ring: "focus:ring-sky-500",
  },
  {
    label: "Ámbar",
    bg: "bg-amber-50/50 hover:bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    dot: "bg-amber-500",
    hover: "hover:border-amber-200",
    ring: "focus:ring-amber-500",
  },
  {
    label: "Rosa",
    bg: "bg-rose-50/50 hover:bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-100",
    dot: "bg-rose-500",
    hover: "hover:border-rose-200",
    ring: "focus:ring-rose-500",
  },
  {
    label: "Púrpura",
    bg: "bg-purple-50/50 hover:bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-100",
    dot: "bg-purple-500",
    hover: "hover:border-purple-200",
    ring: "focus:ring-purple-500",
  },
  {
    label: "Gris",
    bg: "bg-neutral-50/50 hover:bg-neutral-50",
    text: "text-neutral-600",
    border: "border-neutral-200",
    dot: "bg-neutral-400",
    hover: "hover:border-neutral-300",
    ring: "focus:ring-neutral-500",
  },
];
