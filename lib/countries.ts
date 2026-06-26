import type { Country } from "./types";

/**
 * Apple-supported storefronts with chart data. The ISO 3166-1 alpha-2 code
 * (lowercase) doubles as the Apple storefront code used by the RSS feed.
 * lat/lng are approximate visual centroids used for camera fly-to + markers.
 */
export const COUNTRIES: Country[] = [
  { code: "us", name: "United States", flag: "🇺🇸", lat: 39.8, lng: -98.6 },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧", lat: 54.0, lng: -2.4 },
  { code: "ca", name: "Canada", flag: "🇨🇦", lat: 56.1, lng: -106.3 },
  { code: "mx", name: "Mexico", flag: "🇲🇽", lat: 23.6, lng: -102.5 },
  { code: "br", name: "Brazil", flag: "🇧🇷", lat: -14.2, lng: -51.9 },
  { code: "ar", name: "Argentina", flag: "🇦🇷", lat: -38.4, lng: -63.6 },
  { code: "cl", name: "Chile", flag: "🇨🇱", lat: -35.7, lng: -71.5 },
  { code: "co", name: "Colombia", flag: "🇨🇴", lat: 4.6, lng: -74.3 },
  { code: "pe", name: "Peru", flag: "🇵🇪", lat: -9.2, lng: -75.0 },
  { code: "ec", name: "Ecuador", flag: "🇪🇨", lat: -1.8, lng: -78.2 },
  { code: "uy", name: "Uruguay", flag: "🇺🇾", lat: -32.5, lng: -55.8 },
  { code: "cr", name: "Costa Rica", flag: "🇨🇷", lat: 9.7, lng: -83.8 },
  { code: "gt", name: "Guatemala", flag: "🇬🇹", lat: 15.8, lng: -90.2 },
  { code: "do", name: "Dominican Republic", flag: "🇩🇴", lat: 18.7, lng: -70.2 },
  { code: "pa", name: "Panama", flag: "🇵🇦", lat: 8.5, lng: -80.8 },
  { code: "fr", name: "France", flag: "🇫🇷", lat: 46.6, lng: 2.2 },
  { code: "de", name: "Germany", flag: "🇩🇪", lat: 51.2, lng: 10.4 },
  { code: "es", name: "Spain", flag: "🇪🇸", lat: 40.4, lng: -3.7 },
  { code: "it", name: "Italy", flag: "🇮🇹", lat: 41.9, lng: 12.6 },
  { code: "pt", name: "Portugal", flag: "🇵🇹", lat: 39.4, lng: -8.2 },
  { code: "nl", name: "Netherlands", flag: "🇳🇱", lat: 52.1, lng: 5.3 },
  { code: "be", name: "Belgium", flag: "🇧🇪", lat: 50.5, lng: 4.5 },
  { code: "ie", name: "Ireland", flag: "🇮🇪", lat: 53.4, lng: -8.2 },
  { code: "ch", name: "Switzerland", flag: "🇨🇭", lat: 46.8, lng: 8.2 },
  { code: "at", name: "Austria", flag: "🇦🇹", lat: 47.5, lng: 14.6 },
  { code: "lu", name: "Luxembourg", flag: "🇱🇺", lat: 49.8, lng: 6.1 },
  { code: "se", name: "Sweden", flag: "🇸🇪", lat: 60.1, lng: 18.6 },
  { code: "no", name: "Norway", flag: "🇳🇴", lat: 60.5, lng: 8.5 },
  { code: "dk", name: "Denmark", flag: "🇩🇰", lat: 56.3, lng: 9.5 },
  { code: "fi", name: "Finland", flag: "🇫🇮", lat: 61.9, lng: 25.7 },
  { code: "is", name: "Iceland", flag: "🇮🇸", lat: 64.9, lng: -19.0 },
  { code: "pl", name: "Poland", flag: "🇵🇱", lat: 51.9, lng: 19.1 },
  { code: "cz", name: "Czechia", flag: "🇨🇿", lat: 49.8, lng: 15.5 },
  { code: "sk", name: "Slovakia", flag: "🇸🇰", lat: 48.7, lng: 19.7 },
  { code: "hu", name: "Hungary", flag: "🇭🇺", lat: 47.2, lng: 19.5 },
  { code: "ro", name: "Romania", flag: "🇷🇴", lat: 45.9, lng: 24.9 },
  { code: "bg", name: "Bulgaria", flag: "🇧🇬", lat: 42.7, lng: 25.5 },
  { code: "gr", name: "Greece", flag: "🇬🇷", lat: 39.1, lng: 21.8 },
  { code: "hr", name: "Croatia", flag: "🇭🇷", lat: 45.1, lng: 15.2 },
  { code: "rs", name: "Serbia", flag: "🇷🇸", lat: 44.0, lng: 21.0 },
  { code: "si", name: "Slovenia", flag: "🇸🇮", lat: 46.1, lng: 14.8 },
  { code: "lt", name: "Lithuania", flag: "🇱🇹", lat: 55.2, lng: 23.9 },
  { code: "lv", name: "Latvia", flag: "🇱🇻", lat: 56.9, lng: 24.6 },
  { code: "ee", name: "Estonia", flag: "🇪🇪", lat: 58.6, lng: 25.0 },
  { code: "ua", name: "Ukraine", flag: "🇺🇦", lat: 48.4, lng: 31.2 },
  { code: "tr", name: "Turkey", flag: "🇹🇷", lat: 38.9, lng: 35.2 },
  { code: "il", name: "Israel", flag: "🇮🇱", lat: 31.0, lng: 34.9 },
  { code: "sa", name: "Saudi Arabia", flag: "🇸🇦", lat: 23.9, lng: 45.1 },
  { code: "ae", name: "United Arab Emirates", flag: "🇦🇪", lat: 23.4, lng: 53.8 },
  { code: "eg", name: "Egypt", flag: "🇪🇬", lat: 26.8, lng: 30.8 },
  { code: "ma", name: "Morocco", flag: "🇲🇦", lat: 31.8, lng: -7.1 },
  { code: "za", name: "South Africa", flag: "🇿🇦", lat: -30.6, lng: 22.9 },
  { code: "ng", name: "Nigeria", flag: "🇳🇬", lat: 9.1, lng: 8.7 },
  { code: "ke", name: "Kenya", flag: "🇰🇪", lat: -0.0, lng: 37.9 },
  { code: "in", name: "India", flag: "🇮🇳", lat: 22.0, lng: 79.0 },
  { code: "pk", name: "Pakistan", flag: "🇵🇰", lat: 30.4, lng: 69.3 },
  { code: "bd", name: "Bangladesh", flag: "🇧🇩", lat: 23.7, lng: 90.4 },
  { code: "lk", name: "Sri Lanka", flag: "🇱🇰", lat: 7.9, lng: 80.8 },
  { code: "np", name: "Nepal", flag: "🇳🇵", lat: 28.4, lng: 84.1 },
  { code: "cn", name: "China", flag: "🇨🇳", lat: 35.9, lng: 104.2 },
  { code: "hk", name: "Hong Kong", flag: "🇭🇰", lat: 22.3, lng: 114.2 },
  { code: "tw", name: "Taiwan", flag: "🇹🇼", lat: 23.7, lng: 121.0 },
  { code: "jp", name: "Japan", flag: "🇯🇵", lat: 36.2, lng: 138.3 },
  { code: "kr", name: "South Korea", flag: "🇰🇷", lat: 35.9, lng: 127.8 },
  { code: "th", name: "Thailand", flag: "🇹🇭", lat: 15.9, lng: 101.0 },
  { code: "vn", name: "Vietnam", flag: "🇻🇳", lat: 14.1, lng: 108.3 },
  { code: "ph", name: "Philippines", flag: "🇵🇭", lat: 12.9, lng: 121.8 },
  { code: "id", name: "Indonesia", flag: "🇮🇩", lat: -0.8, lng: 113.9 },
  { code: "my", name: "Malaysia", flag: "🇲🇾", lat: 4.2, lng: 101.9 },
  { code: "sg", name: "Singapore", flag: "🇸🇬", lat: 1.35, lng: 103.8 },
  { code: "au", name: "Australia", flag: "🇦🇺", lat: -25.3, lng: 133.8 },
  { code: "nz", name: "New Zealand", flag: "🇳🇿", lat: -40.9, lng: 174.9 },
];

/** Fast lookup by ISO code. */
export const COUNTRY_BY_CODE: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c]),
);

/** Default country when none is selected. */
export const DEFAULT_COUNTRY = "us";

/** Resolve a (possibly user-supplied) code to a known country, or undefined. */
export function getCountry(code: string | null | undefined): Country | undefined {
  if (!code) return undefined;
  return COUNTRY_BY_CODE[code.toLowerCase()];
}

/** Pick a random country, optionally excluding one code. */
export function randomCountry(excludeCode?: string): Country {
  const pool = excludeCode
    ? COUNTRIES.filter((c) => c.code !== excludeCode)
    : COUNTRIES;
  return pool[Math.floor(Math.random() * pool.length)];
}
