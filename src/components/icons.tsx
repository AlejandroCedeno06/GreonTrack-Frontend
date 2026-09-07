// Iconos de línea, dibujados a mano en SVG (sin librerías externas) para que
// combinen con el estilo del logo y no dependan de un icon-set genérico.

type IconProps = { className?: string };

export function MonitorIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 12l2.5-3L12 11l2-2.5L17 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13 3 5 13.5h5.2L10.4 21 19 10.2h-5.3L13 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LeafIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 20c0-8.5 5-15 16-15 0 10.5-6.5 16-16 16 0-3 1-6 3-8.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkChartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20V4M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M7 16v-3M11 16V8M15 16v-5M19 16V6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3.5 19 6v6c0 4.5-3 7.7-7 8.5-4-.8-7-4-7-8.5V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 11.5 12 4l8 7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10v9a1 1 0 0 0 1 1h3v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3a1 1 0 0 0 1-1v-9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlugIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 3v5M15 3v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M6 8h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 17v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LightbulbIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 18h6M10 21h4M8 14.5a5 5 0 1 1 8 0c-.8 1-1.3 1.7-1.3 3H9.3c0-1.3-.5-2-1.3-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FileIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 3.5h7l4 4V19a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 19V4.7A1.2 1.2 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3.5V8h4M9 13h6M9 16.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function GearIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M4.9 6.9l1.6 1.6M17.5 15.5l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.1l1.6-1.6M17.5 8.5l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 4H6a1.2 1.2 0 0 0-1.2 1.2v13.6A1.2 1.2 0 0 0 6 20h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 16l4-4-4-4M18 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 10a6 6 0 1 1 12 0c0 3.2 1 4.7 1.6 5.4.3.3.1.9-.4.9H4.8c-.5 0-.7-.6-.4-.9C5 14.7 6 13.2 6 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 19.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.5 4.5 19.5 8.5 8 20H4v-4L15.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 7h15M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6.5 7l.7 12a1.2 1.2 0 0 0 1.2 1.1h7.2a1.2 1.2 0 0 0 1.2-1.1L17.5 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function WifiIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 18.2h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 14.8a5 5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5.3 11.6a9.5 9.5 0 0 1 13.4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2 8.4a14 14 0 0 1 20 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GoogleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.44H12v4.62h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.27-2.09 3.58-5.17 3.58-8.83Z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3.02c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.27v3.11C3.25 21.3 7.31 24 12 24Z"
        fill="#34A853"
      />
      <path
        d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4.02-3.11Z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4.02 3.11C6.23 6.88 8.88 4.77 12 4.77Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LaptopIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="4.5" width="14" height="9.5" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M2.5 18.5h19l-1.4 2.1a1.2 1.2 0 0 1-1 .54H4.9a1.2 1.2 0 0 1-1-.54L2.5 18.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M2.5 18.5h19v-1.2a1 1 0 0 0-1-1H3.5a1 1 0 0 0-1 1v1.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function TvIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="4" width="19" height="12.5" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 21l4-3.5 4 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FridgeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="2" width="12" height="20" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 9.5h12" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 4.2v2.6M9 11.2v2.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function AcIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="5" width="19" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 15.5c1 1 2 1 3 0s2-1 3 0 2 1 3 0 2-1 3 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 19c1 1 2 1 3 0s2-1 3 0 2 1 3 0 2-1 3 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 19h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function GameConsoleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.5 9h9a4 4 0 0 1 4 4v2.3a2.4 2.4 0 0 1-4.36 1.37L15 15.2H9l-1.14 1.47A2.4 2.4 0 0 1 3.5 15.3V13a4 4 0 0 1 4-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 11.5v2.4M6.8 12.7h2.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16.2" cy="11.8" r="0.9" fill="currentColor" />
      <circle cx="18.2" cy="13.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function WashingMachineIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 6.3h2M15.6 6.3a0.9 0.9 0 1 0 0.01 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="14" r="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function MicrowaveIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="20" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4.3" y="8.3" width="10" height="8.4" rx="0.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M17.3 9.3h2.2M17.3 12.2h2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="18.4" cy="15.2" r="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IotIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.6 4.6a10.4 10.4 0 0 0 0 14.8M19.4 4.6a10.4 10.4 0 0 1 0 14.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PrinterIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 8.5V3.5h11v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="2.5" y="8.5" width="19" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 15h11v5.5h-11V15Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="18" cy="11.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 12a8 8 0 0 1 13.66-5.66L20 8.5M20 8.5V4M20 8.5h-4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 12a8 8 0 0 1-13.66 5.66L4 15.5M4 15.5V20M4 15.5h4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AccessibilityIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="4.5" r="1.9" fill="currentColor" />
      <path
        d="M4.5 8.2c2.4.9 5 1.4 7.5 1.4s5.1-.5 7.5-1.4M12 9.6v3.6l3.6 6.6M12 13.2 8.4 19.8M10.3 13.2h3.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 14.2a8.2 8.2 0 1 1-9.2-11 6.6 6.6 0 0 0 9.2 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function TreeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3 6 11h3l-4 6h5v4M12 3l6 8h-3l4 6h-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 16V12l2-5h12l2 5v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 16h18v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 12h12M7 8.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7.5" cy="17" r="0.9" fill="currentColor" />
      <circle cx="16.5" cy="17" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function TrendUpIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16 10 10l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FireIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3c1 2.5-1.5 3.8-1.5 6.2 0 1.1.9 2 2 2s2-1 2-2.1c1.8 1.3 3 3.4 3 5.7a5.5 5.5 0 1 1-11 0c0-3.6 2.2-5.4 3.6-7.3C11 5.8 11.6 4.4 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HelpIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.3 9.4a2.7 2.7 0 1 1 3.9 2.4c-.9.5-1.7 1.1-1.7 2.1v.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11.5" cy="16.9" r="0.95" fill="currentColor" />
    </svg>
  );
}

export function TrendDownIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8 10 14l4-4 6 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 17h5v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
