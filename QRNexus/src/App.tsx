"use client";
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  HelpCircle,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Share2,
  Menu,
  X,
  ChevronDown,
  Copy,
  Twitter,
  Facebook,
  QrCode,
  Download,
  Palette,
  Image as ImagePlus,
  Type,
  Brush,
  AlertTriangle,
  CheckCircle,
  Upload,
  FileText,
  Loader,
  Bold,
  Italic,
  Trash2,
} from "lucide-react";
import QRCodeStyling, {
  Options as QRCodeStylingOptions,
  FileExtension,
  DotType,
  CornerSquareType,
  CornerDotType,
  Gradient,
} from "qr-code-styling";
import Papa, { ParseResult } from "papaparse";
import JSZip from "jszip";

const SIDEBAR_ITEMS = [
  { name: "QR Generator", icon: QrCode, path: "generator" },
  { name: "About", icon: Info, path: "about" },
  { name: "Help", icon: HelpCircle, path: "help" },
  { name: "Settings", icon: SettingsIcon, path: "settings" },
];

const APP_NAME = "QR Nexus";
const DEFAULT_THEME: "light" | "dark" = "light";
const DEFAULT_PAGE = "generator";
// UPDATED: Added font weight 900 for Lexend to support extra-bold text
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;900&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&family=Oswald:wght@400;700&family=Poppins:wght@400;600&display=swap";

interface AppContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showShareModal: boolean;
  setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
  showBulkModal: boolean;
  setShowBulkModal: React.Dispatch<React.SetStateAction<boolean>>;
  showDownloadZipModal: boolean;
  setShowDownloadZipModal: React.Dispatch<React.SetStateAction<boolean>>;
  zipUrl: string;
  setZipUrl: React.Dispatch<React.SetStateAction<string>>;
  qrOptions: QRCodeStylingOptions;
  setQrOptions: React.Dispatch<React.SetStateAction<QRCodeStylingOptions>>;
  // ADDED: State for QR data moved here for persistence
  data: string;
  setData: React.Dispatch<React.SetStateAction<string>>;
  logo: string | null;
  setLogo: React.Dispatch<React.SetStateAction<string | null>>;
  textLabel: string;
  setTextLabel: React.Dispatch<React.SetStateAction<string>>;
  textColor: string;
  setTextColor: React.Dispatch<React.SetStateAction<string>>;
  textMargin: number;
  setTextMargin: React.Dispatch<React.SetStateAction<number>>;
  textFontSize: number;
  setTextFontSize: React.Dispatch<React.SetStateAction<number>>;
  textFontFamily: string;
  setTextFontFamily: React.Dispatch<React.SetStateAction<string>>;
  // REPLACED: isTextBold boolean replaced with fontWeight string
  fontWeight: string;
  setFontWeight: React.Dispatch<React.SetStateAction<string>>;
  isTextItalic: boolean;
  setIsTextItalic: React.Dispatch<React.SetStateAction<boolean>>;
  textBackgroundColor: string | null;
  setTextBackgroundColor: React.Dispatch<React.SetStateAction<string | null>>;
  downloadSize: number;
  setDownloadSize: React.Dispatch<React.SetStateAction<number>>;
  colorType: "single" | "gradient";
  setColorType: React.Dispatch<React.SetStateAction<"single" | "gradient">>;
  gradient: Gradient;
  setGradient: React.Dispatch<React.SetStateAction<Gradient>>;
}

const AppContext = createContext<AppContextType | null>(null);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within an AppProvider");
  return context;
};

const GlobalStyles: React.FC = () => (
  <style>
    {`
     :root {
       --theme-font-family: 'Lexend', sans-serif;
       --theme-bg-primary: #FFFFFF;
       --theme-bg-secondary: #F7F9FC;
       --theme-bg-tertiary: #EAF0F6;
       --theme-content-area-bg: #F7F9FC;
       --theme-text-primary: #1A202C;
       --theme-text-secondary: #4A5568;
       --theme-text-tertiary: #A0AEC0;
       --theme-accent-primary: #3B82F6;
       --theme-accent-primary-text: #FFFFFF;
       --theme-accent-secondary: #10B981;
       --theme-accent-danger: #EF4444;
       --theme-border-primary: #E2E8F0;
       --theme-border-secondary: #CBD5E1;
       --theme-border-tertiary: #F1F5F9;
       --theme-shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
       --theme-shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.025), 0 1px 2px -1px rgba(0, 0, 0, 0.025);
       --theme-shadow-md: 0 3px 5px -1px rgba(0, 0, 0, 0.03), 0 2px 3px -2px rgba(0, 0, 0, 0.03);
       --theme-shadow-lg: 0 7px 10px -3px rgba(0, 0, 0, 0.04), 0 2px 4px -4px rgba(0, 0, 0, 0.04);
       --theme-toast-success-bg: var(--theme-accent-secondary);
       --theme-toast-error-bg: var(--theme-accent-danger);
       --theme-toast-info-bg: var(--theme-accent-primary);
       --theme-toast-text-color: #FFFFFF;
       --theme-sidebar-width: 260px;
       --theme-header-height: 64px;
     }
     html.dark {
       --theme-bg-primary: #1F2937;
       --theme-bg-secondary: #111827;
       --theme-bg-tertiary: #374151;
       --theme-content-area-bg: #111827;
       --theme-text-primary: #F3F4F6;
       --theme-text-secondary: #9CA3AF;
       --theme-text-tertiary: #6B7280;
       --theme-accent-primary: #60A5FA;
       --theme-accent-primary-text: #FFFFFF;
       --theme-accent-secondary: #34D399;
       --theme-accent-danger: #F87171;
       --theme-border-primary: #374151;
       --theme-border-secondary: #4B5563;
       --theme-border-tertiary: #2d333b;
       --theme-shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.08);
       --theme-shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
       --theme-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.12), 0 2px 4px -2px rgba(0, 0, 0, 0.12);
       --theme-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -4px rgba(0, 0, 0, 0.12);
     }
     body {
       font-family: var(--theme-font-family);
       background-color: var(--theme-content-area-bg);
       color: var(--theme-text-primary);
       margin: 0;
       -webkit-font-smoothing: antialiased;
       -moz-osx-font-smoothing: grayscale;
       font-size: 14px;
       line-height: 1.65;
     }
     ::-webkit-scrollbar { width: 6px; height: 6px; }
     ::-webkit-scrollbar-track { background: var(--theme-bg-tertiary); border-radius: 6px; }
     ::-webkit-scrollbar-thumb { background: var(--theme-text-tertiary); border-radius: 6px; }
     ::-webkit-scrollbar-thumb:hover { background: var(--theme-text-secondary); }
     @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
     .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
     @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
     .animate-spin-slow { animation: spin 2s linear infinite; }
     .transition-all-theme { transition: all 0.2s ease-in-out; }
     input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; background: var(--theme-bg-tertiary); border-radius: 5px; outline: none; }
     input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; background: var(--theme-accent-primary); border-radius: 50%; cursor: pointer; }
     input[type="range"]::-moz-range-thumb { width: 16px; height: 16px; background: var(--theme-accent-primary); border-radius: 50%; cursor: pointer; border: none; }
     `}
  </style>
);

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode;
  noPadding?: boolean;
}
const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  actions,
  noPadding = false,
}) => (
  <div
    className={`bg-[var(--theme-bg-primary)] rounded-xl shadow-[var(--theme-shadow-md)] border border-[var(--theme-border-tertiary)] ${
      noPadding ? "" : "p-5 sm:p-6"
    } ${className}`}
  >
    {(title || actions) && (
      <div
        className={`flex items-center justify-between ${
          noPadding ? "px-5 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4" : "mb-4 sm:mb-5"
        }`}
      >
        {title && (
          <h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">
            {title}
          </h3>
        )}
        {actions && (
          <div className="flex items-center space-x-2">{actions}</div>
        )}
      </div>
    )}
    {children}
  </div>
);

const PageWrapper: React.FC<{
  title: string;
  children?: ReactNode;
}> = ({ title, children }) => (
  <div className="p-4 sm:p-6 animate-fadeIn">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 sm:mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--theme-text-primary)] mb-2.5 sm:mb-0">
        {title}
      </h1>
    </div>
    {children}
  </div>
);

const OptionSection: React.FC<{
  title: string;
  icon: React.ElementType;
  children: ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <details
    className="py-4 border-b border-[var(--theme-border-primary)] group"
    open
  >
    <summary className="flex items-center gap-3 cursor-pointer">
      <Icon size={18} className="text-[var(--theme-accent-primary)]" />
      <h3 className="font-semibold text-md text-[var(--theme-text-primary)] flex-grow">
        {title}
      </h3>
      <ChevronDown
        size={16}
        className="text-[var(--theme-text-tertiary)] transition-transform duration-200 group-open:rotate-180"
      />
    </summary>
    <div className="pt-4 space-y-4">{children}</div>
  </details>
);

const LabeledInput: React.FC<{
  label: string;
  children: ReactNode;
  htmlFor?: string;
}> = ({ label, children, htmlFor }) => (
  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
    <label
      htmlFor={htmlFor}
      className="text-sm text-[var(--theme-text-secondary)] font-medium md:w-1/4 shrink-0"
    >
      {label}
    </label>
    <div className="flex-grow">{children}</div>
  </div>
);

const ColorInput: React.FC<{
  value: string;
  onChange: (color: string) => void;
}> = ({ value, onChange }) => {
  const colorInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2 w-full p-1.5 rounded-lg border border-[var(--theme-border-secondary)] bg-[var(--theme-bg-secondary)]">
      <input
        ref={colorInputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-7 p-0 border-none rounded-md cursor-pointer appearance-none bg-transparent"
        style={{ backgroundColor: value }}
        title="Click to change color"
      />
      <input
        type="text"
        value={value.toUpperCase()}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-[var(--theme-text-secondary)] focus:outline-none"
      />
    </div>
  );
};

const CustomSelect: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ options, value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || value;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 text-sm rounded-lg border border-[var(--theme-border-secondary)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent-primary)] focus:border-[var(--theme-accent-primary)] transition-all-theme"
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`text-[var(--theme-text-tertiary)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 5 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-20 mt-1 w-full bg-[var(--theme-bg-primary)] rounded-md shadow-lg border border-[var(--theme-border-tertiary)] max-h-60 overflow-auto py-1"
          >
            {options.map((option) => (
              <a
                key={option.value}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block px-3 py-1.5 text-sm transition-colors ${
                  value === option.value
                    ? "bg-[var(--theme-accent-primary)] text-[var(--theme-accent-primary-text)]"
                    : "text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-tertiary)]"
                }`}
              >
                {option.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ShapeSelector: React.FC<{
  title: string;
  options: {
    name: string;
    value: DotType | CornerSquareType | CornerDotType;
  }[];
  selectedValue: string;
  onSelect: (value: any) => void;
}> = ({ title, options, selectedValue, onSelect }) => (
  <div>
    <h4 className="text-sm text-[var(--theme-text-secondary)] font-medium mb-2">
      {title}
    </h4>
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {options.map((opt) => (
        <button
          key={opt.name}
          title={opt.name}
          onClick={() => onSelect(opt.value)}
          className={`h-10 flex items-center justify-center p-2 rounded-lg border-2 transition-all-theme text-xs font-semibold ${
            selectedValue === opt.value
              ? "border-[var(--theme-accent-primary)] bg-[var(--theme-accent-primary)] text-white"
              : "border-[var(--theme-border-secondary)] bg-[var(--theme-bg-secondary)] hover:border-[var(--theme-text-secondary)]"
          }`}
        >
          {opt.name}
        </button>
      ))}
    </div>
  </div>
);

const QRGeneratorPage = () => {
  const {
    showToast,
    setShowBulkModal,
    qrOptions,
    setQrOptions,
    // ADDED: Get global data state
    data,
    setData,
    logo,
    setLogo,
    textLabel,
    setTextLabel,
    textColor,
    setTextColor,
    textMargin,
    setTextMargin,
    textFontSize,
    setTextFontSize,
    textFontFamily,
    setTextFontFamily,
    // REPLACED: isTextBold with fontWeight
    fontWeight,
    setFontWeight,
    isTextItalic,
    setIsTextItalic,
    textBackgroundColor,
    setTextBackgroundColor,
    downloadSize,
    setDownloadSize,
    colorType,
    setColorType,
    gradient,
    setGradient,
  } = useAppContext();

  const [fileExt, setFileExt] = useState<FileExtension>("png");

  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (qrRef.current && !qrCodeInstance.current) {
        qrCodeInstance.current = new QRCodeStyling({
          ...qrOptions,
          data: data || " ",
        });
        qrCodeInstance.current.append(qrRef.current);
      }
    }
  }, []);

  // FIXED: This effect is rewritten to correctly preserve shape types
  // when updating colors and gradients.
  useEffect(() => {
    if (!qrCodeInstance.current) return;

    let finalOptions: Partial<QRCodeStylingOptions> = { ...qrOptions };

    if (colorType === "gradient") {
      // When using gradient, ensure single color properties are unset
      finalOptions.dotsOptions = {
        ...finalOptions.dotsOptions,
        gradient: gradient,
        color: undefined,
      };
      finalOptions.cornersSquareOptions = {
        ...finalOptions.cornersSquareOptions,
        gradient: gradient,
        color: undefined,
      };
      finalOptions.cornersDotOptions = {
        ...finalOptions.cornersDotOptions,
        gradient: gradient,
        color: undefined,
      };
    } else {
      // When using single color, ensure gradient is unset
      finalOptions.dotsOptions = {
        ...finalOptions.dotsOptions,
        color: qrOptions.dotsOptions?.color,
        gradient: undefined,
      };
      finalOptions.cornersSquareOptions = {
        ...finalOptions.cornersSquareOptions,
        color: qrOptions.cornersSquareOptions?.color,
        gradient: undefined,
      };
      finalOptions.cornersDotOptions = {
        ...finalOptions.cornersDotOptions,
        color: qrOptions.cornersDotOptions?.color,
        gradient: undefined,
      };
    }

    qrCodeInstance.current.update({
      ...finalOptions,
      data: data || " ",
      image: logo || undefined,
    });
  }, [qrOptions, data, logo, colorType, gradient]);

  const handleShapeChange = (
    optionKey:
      | "dotsOptions"
      | "cornersSquareOptions"
      | "cornersDotOptions"
      | "imageOptions",
    value: any
  ) => {
    setQrOptions((prev) => ({
      ...prev,
      [optionKey]: {
        ...(prev[optionKey] as object),
        ...value,
      },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Logo image must be less than 2MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
        showToast("Logo updated successfully!", "success");
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleDownload = useCallback(async () => {
    let foregroundOptions: Partial<QRCodeStylingOptions> = {};
    if (colorType === "gradient") {
      foregroundOptions = {
        dotsOptions: { ...qrOptions.dotsOptions, gradient },
        cornersSquareOptions: { ...qrOptions.cornersSquareOptions, gradient },
        cornersDotOptions: { ...qrOptions.cornersDotOptions, gradient },
      };
    }

    const downloadQr = new QRCodeStyling({
      ...qrOptions,
      ...foregroundOptions,
      width: downloadSize,
      height: downloadSize,
      image: logo || undefined,
      data: data || " ",
    });

    if (fileExt === "svg" || !textLabel.trim()) {
      if (fileExt === "svg" && textLabel.trim()) {
        showToast("Text label is not supported for SVG download.", "info");
      }
      downloadQr.download({
        name: "qr-nexus-code",
        extension: fileExt,
      });
      return;
    }

    try {
      const rawData = await downloadQr.getRawData(fileExt);
      if (!rawData) throw new Error("Could not get QR code data.");

      const url = URL.createObjectURL(rawData as Blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const scaleFactor = downloadSize / (qrOptions.width || 300);
        const scaledFontSize = textFontSize * scaleFactor;
        const scaledTextMargin = textMargin * scaleFactor;

        // FIXED: Use fontWeight state for more options
        const fontVariant = isTextItalic ? "italic" : "normal";
        // fontWeight can be 'normal', 'bold', or a numeric string like '700'
        const font = `${fontVariant} ${fontWeight} ${scaledFontSize}px ${textFontFamily}`;
        ctx.font = font;

        const textMetrics = ctx.measureText(textLabel);
        const textHeight =
          textMetrics.actualBoundingBoxAscent +
          textMetrics.actualBoundingBoxDescent;
        const backgroundVPadding = textBackgroundColor ? 10 * scaleFactor : 0;

        canvas.width = img.width;
        canvas.height =
          img.height + scaledTextMargin + textHeight + backgroundVPadding * 2;

        if (fileExt !== "png") {
          ctx.fillStyle = qrOptions.backgroundOptions?.color || "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        if (textBackgroundColor) {
          ctx.fillStyle = textBackgroundColor;
          ctx.fillRect(
            0,
            img.height + scaledTextMargin,
            canvas.width,
            textHeight + backgroundVPadding * 2
          );
        }

        ctx.font = font;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText(
          textLabel,
          canvas.width / 2,
          img.height +
            scaledTextMargin +
            backgroundVPadding +
            textMetrics.actualBoundingBoxAscent
        );

        const link = document.createElement("a");
        link.download = `qr-nexus-code.${fileExt}`;
        link.href = canvas.toDataURL(`image/${fileExt}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      img.onerror = () => {
        showToast("Failed to load QR image for download.", "error");
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (error) {
      console.error(error);
      showToast("An error occurred during download.", "error");
    }
  }, [
    data,
    logo,
    qrOptions,
    downloadSize,
    colorType,
    gradient,
    fileExt,
    textLabel,
    textColor,
    textMargin,
    textFontSize,
    textFontFamily,
    fontWeight, // Use fontWeight instead of isTextBold
    isTextItalic,
    textBackgroundColor,
    showToast,
  ]);

  const bodyShapes: { name: string; value: DotType }[] = [
    { name: "Square", value: "square" },
    { name: "Dots", value: "dots" },
    { name: "Rounded", value: "rounded" },
    { name: "Extra Rounded", value: "extra-rounded" },
    { name: "Classy", value: "classy" },
    { name: "Classy Rounded", value: "classy-rounded" },
  ];
  const eyeFrameShapes: { name: string; value: CornerSquareType }[] = [
    { name: "Square", value: "square" },
    { name: "Extra Rounded", value: "extra-rounded" },
    { name: "Dot", value: "dot" },
  ];
  const eyeBallShapes: { name: string; value: CornerDotType }[] = [
    { name: "Square", value: "square" },
    { name: "Dot", value: "dot" },
  ];

  const fontOptions = [
    { value: "Lexend", label: "Lexend" },
    { value: "Roboto", label: "Roboto" },
    { value: "Oswald", label: "Oswald" },
    { value: "Poppins", label: "Poppins" },
    { value: "Arial", label: "Arial" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Verdana", label: "Verdana" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Courier New", label: "Courier New" },
  ];

  // ADDED: Handler for the new boldness cycle button
  const toggleFontWeight = () => {
    setFontWeight((current) => {
      if (current === "400") return "700"; // Normal -> Bold
      if (current === "700") return "900"; // Bold -> Extra-Bold
      return "400"; // Extra-Bold -> Normal
    });
  };

  return (
    <PageWrapper title="QR Code Generator">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
        <Card className="lg:col-span-2" noPadding>
          <div className="p-5 sm:p-6 max-h-[calc(100vh-220px)] overflow-y-auto">
            <OptionSection title="Content" icon={Type}>
              <textarea
                value={data}
                onChange={(e) => setData(e.target.value)}
                rows={4}
                placeholder="Enter URL or text"
                className="w-full p-2.5 text-sm rounded-lg border border-[var(--theme-border-secondary)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-primary)] placeholder-[var(--theme-text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent-primary)] focus:border-[var(--theme-accent-primary)] transition-all-theme"
              />
            </OptionSection>

            <OptionSection title="Colors" icon={Palette}>
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="colorType"
                    value="single"
                    checked={colorType === "single"}
                    onChange={() => setColorType("single")}
                    className="form-radio h-4 w-4 text-[var(--theme-accent-primary)] bg-[var(--theme-bg-tertiary)] border-[var(--theme-border-secondary)] focus:ring-[var(--theme-accent-primary)]"
                  />
                  <span className="text-sm font-medium text-[var(--theme-text-secondary)]">
                    Single Color
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="colorType"
                    value="gradient"
                    checked={colorType === "gradient"}
                    onChange={() => setColorType("gradient")}
                    className="form-radio h-4 w-4 text-[var(--theme-accent-primary)] bg-[var(--theme-bg-tertiary)] border-[var(--theme-border-secondary)] focus:ring-[var(--theme-accent-primary)]"
                  />
                  <span className="text-sm font-medium text-[var(--theme-text-secondary)]">
                    Gradient
                  </span>
                </label>
              </div>
              {colorType === "single" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabeledInput label="Foreground">
                    <ColorInput
                      value={qrOptions.dotsOptions?.color || "#000000"}
                      onChange={(color) =>
                        setQrOptions((prev) => ({
                          ...prev,
                          dotsOptions: { ...prev.dotsOptions, color },
                        }))
                      }
                    />
                  </LabeledInput>
                  <LabeledInput label="Background">
                    <ColorInput
                      value={qrOptions.backgroundOptions?.color || "#FFFFFF"}
                      onChange={(color) =>
                        setQrOptions((prev) => ({
                          ...prev,
                          backgroundOptions: {
                            ...prev.backgroundOptions,
                            color,
                          },
                        }))
                      }
                    />
                  </LabeledInput>
                  <LabeledInput label="Eye Frame">
                    <ColorInput
                      value={qrOptions.cornersSquareOptions?.color || "#000000"}
                      onChange={(color) =>
                        setQrOptions((prev) => ({
                          ...prev,
                          cornersSquareOptions: {
                            ...prev.cornersSquareOptions,
                            color,
                          },
                        }))
                      }
                    />
                  </LabeledInput>
                  <LabeledInput label="Eye Ball">
                    <ColorInput
                      value={qrOptions.cornersDotOptions?.color || "#000000"}
                      onChange={(color) =>
                        setQrOptions((prev) => ({
                          ...prev,
                          cornersDotOptions: {
                            ...prev.cornersDotOptions,
                            color,
                          },
                        }))
                      }
                    />
                  </LabeledInput>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LabeledInput label="Gradient Start">
                      <ColorInput
                        value={gradient.colorStops[0].color}
                        onChange={(color) =>
                          setGradient((g) => ({
                            ...g,
                            colorStops: [
                              { ...g.colorStops[0], color },
                              g.colorStops[1],
                            ],
                          }))
                        }
                      />
                    </LabeledInput>
                    <LabeledInput label="Gradient End">
                      <ColorInput
                        value={gradient.colorStops[1].color}
                        onChange={(color) =>
                          setGradient((g) => ({
                            ...g,
                            colorStops: [
                              g.colorStops[0],
                              { ...g.colorStops[1], color },
                            ],
                          }))
                        }
                      />
                    </LabeledInput>
                  </div>
                  <LabeledInput label="Background">
                    <ColorInput
                      value={qrOptions.backgroundOptions?.color || "#FFFFFF"}
                      onChange={(color) =>
                        setQrOptions((prev) => ({
                          ...prev,
                          backgroundOptions: {
                            ...prev.backgroundOptions,
                            color,
                          },
                        }))
                      }
                    />
                  </LabeledInput>
                  <LabeledInput label="Gradient Type">
                    <CustomSelect
                      value={gradient.type}
                      onChange={(type: string) =>
                        setGradient((g) => ({
                          ...g,
                          type: type as "linear" | "radial",
                        }))
                      }
                      options={[
                        { value: "linear", label: "Linear" },
                        { value: "radial", label: "Radial" },
                      ]}
                    />
                  </LabeledInput>
                  <LabeledInput label="Rotation">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={gradient.rotation}
                      onChange={(e) =>
                        setGradient((g) => ({
                          ...g,
                          rotation: parseInt(e.target.value),
                        }))
                      }
                    />
                  </LabeledInput>
                </div>
              )}
            </OptionSection>

            <OptionSection title="Shapes" icon={Brush}>
              <div className="space-y-4">
                <ShapeSelector
                  title="Body Shape"
                  options={bodyShapes}
                  selectedValue={qrOptions.dotsOptions?.type || "square"}
                  onSelect={(value) =>
                    handleShapeChange("dotsOptions", { type: value })
                  }
                />
                <ShapeSelector
                  title="Eye Frame Shape"
                  options={eyeFrameShapes}
                  selectedValue={
                    qrOptions.cornersSquareOptions?.type || "square"
                  }
                  onSelect={(value) =>
                    handleShapeChange("cornersSquareOptions", { type: value })
                  }
                />
                <ShapeSelector
                  title="Eye Ball Shape"
                  options={eyeBallShapes}
                  selectedValue={qrOptions.cornersDotOptions?.type || "square"}
                  onSelect={(value) =>
                    handleShapeChange("cornersDotOptions", { type: value })
                  }
                />
                <LabeledInput label="QR Margin">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={qrOptions.margin || 0}
                      onChange={(e) =>
                        setQrOptions((prev) => ({
                          ...prev,
                          margin: parseInt(e.target.value, 10),
                        }))
                      }
                    />
                    <span className="text-xs font-mono text-[var(--theme-text-tertiary)]">
                      {qrOptions.margin || 0}
                    </span>
                  </div>
                </LabeledInput>
              </div>
            </OptionSection>

            <OptionSection title="Logo" icon={ImagePlus}>
              <LabeledInput label="Upload Image">
                <label
                  htmlFor="logo-upload"
                  className="w-full block text-center cursor-pointer px-4 py-2 text-sm font-medium rounded-lg border border-[var(--theme-border-secondary)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)] transition-all-theme"
                >
                  {logo ? "Change Logo" : "Select Logo"}
                </label>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </LabeledInput>
              {logo && (
                <>
                  <LabeledInput label="Logo Size">
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={qrOptions.imageOptions?.imageSize}
                      onChange={(e) =>
                        handleShapeChange("imageOptions", {
                          imageSize: parseFloat(e.target.value),
                        })
                      }
                    />
                  </LabeledInput>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setLogo(null)}
                      className="text-xs text-[var(--theme-accent-danger)] hover:underline"
                    >
                      Remove Logo
                    </button>
                  </div>
                </>
              )}
            </OptionSection>

            <OptionSection title="Text Label" icon={Type}>
              <LabeledInput label="Text">
                <input
                  type="text"
                  value={textLabel}
                  onChange={(e) => setTextLabel(e.target.value)}
                  placeholder="Text below QR code"
                  className="w-full p-2.5 text-sm rounded-lg border border-[var(--theme-border-secondary)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-primary)] placeholder-[var(--theme-text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent-primary)] focus:border-[var(--theme-accent-primary)] transition-all-theme"
                />
              </LabeledInput>
              {textLabel.trim() && (
                <>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <p className="text-sm text-[var(--theme-text-secondary)] font-medium md:w-1/4 shrink-0">
                      Format
                    </p>
                    <div className="flex-grow flex items-center gap-2">
                      {/* UPDATED: Bold button now cycles through 3 weights */}
                      <button
                        onClick={toggleFontWeight}
                        title={`Set font weight (current: ${fontWeight})`}
                        className={`p-2 rounded-lg border transition-all-theme ${
                          fontWeight !== "400"
                            ? "bg-[var(--theme-accent-primary)] text-white border-[var(--theme-accent-primary)]"
                            : "bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)] border-[var(--theme-border-secondary)] hover:border-[var(--theme-text-secondary)]"
                        }`}
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        onClick={() => setIsTextItalic(!isTextItalic)}
                        className={`p-2 rounded-lg border transition-all-theme ${
                          isTextItalic
                            ? "bg-[var(--theme-accent-primary)] text-white border-[var(--theme-accent-primary)]"
                            : "bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)] border-[var(--theme-border-secondary)] hover:border-[var(--theme-text-secondary)]"
                        }`}
                      >
                        <Italic size={16} />
                      </button>
                    </div>
                  </div>
                  <LabeledInput label="Text Color">
                    <ColorInput value={textColor} onChange={setTextColor} />
                  </LabeledInput>
                  <LabeledInput label="Label Background">
                    <div className="flex items-center gap-2">
                      <ColorInput
                        value={textBackgroundColor || "#FFFFFF"}
                        onChange={setTextBackgroundColor}
                      />
                      {textBackgroundColor && (
                        <button
                          onClick={() => setTextBackgroundColor(null)}
                          className="p-2 rounded-lg border bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)] border-[var(--theme-border-secondary)] hover:border-[var(--theme-text-secondary)]"
                          title="Clear background color"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </LabeledInput>
                  <LabeledInput label="Font">
                    <CustomSelect
                      value={textFontFamily}
                      onChange={setTextFontFamily}
                      options={fontOptions}
                    />
                  </LabeledInput>
                  <LabeledInput label="Font Size">
                    <input
                      type="range"
                      min="8"
                      max="40"
                      step="1"
                      value={textFontSize}
                      onChange={(e) =>
                        setTextFontSize(parseInt(e.target.value))
                      }
                    />
                  </LabeledInput>
                  <LabeledInput label="Top Margin">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={textMargin}
                      onChange={(e) => setTextMargin(parseInt(e.target.value))}
                    />
                  </LabeledInput>
                </>
              )}
            </OptionSection>
          </div>
        </Card>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card title="Preview" className="flex-grow">
            <div className="p-4 bg-[var(--theme-bg-secondary)] rounded-lg flex flex-col items-center justify-center">
              <div
                ref={qrRef}
                className="[&>canvas]:!w-full [&>canvas]:!h-auto [&>svg]:!w-full [&>svg]:!h-auto"
              />
              {textLabel && (
                <p
                  className="text-center break-words w-full"
                  style={{
                    color: textColor,
                    backgroundColor: textBackgroundColor || "transparent",
                    marginTop: `${textMargin}px`,
                    padding: textBackgroundColor ? "10px 5px" : "0",
                    fontSize: `${textFontSize}px`,
                    fontFamily: textFontFamily,
                    // UPDATED: Use fontWeight state
                    fontWeight: fontWeight,
                    fontStyle: isTextItalic ? "italic" : "normal",
                  }}
                >
                  {textLabel}
                </p>
              )}
            </div>
          </Card>
          <Card title="Download">
            <div className="space-y-4">
              <LabeledInput label="Quality">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="300"
                    max="4000"
                    step="100"
                    value={downloadSize}
                    onChange={(e) => setDownloadSize(parseInt(e.target.value))}
                  />
                  <span className="text-xs font-mono text-[var(--theme-text-tertiary)]">
                    {downloadSize}px
                  </span>
                </div>
              </LabeledInput>
              <div>
                <p className="text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                  Format
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {["png", "jpeg", "webp", "svg"].map((ext) => (
                    <button
                      key={ext}
                      onClick={() => setFileExt(ext as FileExtension)}
                      className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all-theme border ${
                        fileExt === ext
                          ? "bg-[var(--theme-accent-primary)] text-[var(--theme-accent-primary-text)] border-[var(--theme-accent-primary)]"
                          : "bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)] border-[var(--theme-border-secondary)] hover:border-[var(--theme-text-secondary)]"
                      }`}
                    >
                      {ext.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[var(--theme-accent-primary)] text-[var(--theme-accent-primary-text)] hover:opacity-90 transition-opacity"
              >
                <Download size={16} /> Download
              </button>
            </div>
          </Card>
          <Card title="Bulk Generate">
            <p className="text-sm text-[var(--theme-text-secondary)] mb-4">
              Create multiple QR codes from a CSV file using the current style
              settings.
            </p>
            <button
              onClick={() => setShowBulkModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[var(--theme-accent-secondary)] text-white hover:opacity-90 transition-opacity"
            >
              <Upload size={16} /> Upload CSV
            </button>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

const AboutPage = () => (
  <PageWrapper title="About QR Nexus">
    <Card>
      <div className="p-4 space-y-4 text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-[var(--theme-accent-primary)] rounded-lg inline-block shadow-[var(--theme-shadow-md)]">
            <QrCode
              size={32}
              className="text-[var(--theme-accent-primary-text)]"
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[var(--theme-text-primary)]">
          {APP_NAME}
        </h2>
        <p className="text-md text-[var(--theme-text-secondary)]">
          QR Nexus is a modern, responsive, and powerful QR code generation tool
          built with the latest web technologies. Our mission is to provide an
          intuitive and highly customizable experience for creating high-quality
          QR codes for personal and professional use.
        </p>
        <p className="text-md text-[var(--theme-text-secondary)]">
          This application is built using Next.js, Tailwind CSS, and the
          versatile `qr-code-styling` library, delivering a fast, reliable, and
          production-grade user experience.
        </p>
      </div>
    </Card>
  </PageWrapper>
);

const HelpPage = () => (
  <PageWrapper title="Help & Support">
    <Card title="Frequently Asked Questions">
      <div className="space-y-6">
        {[
          {
            q: "How do I generate a QR code?",
            a: "Navigate to the 'QR Generator' page. Enter your desired content (like a URL or text) into the content box. The QR code will update in real-time in the preview panel.",
          },
          {
            q: "How can I customize my QR code?",
            a: "Use the options in the customization panel on the left. You can change colors, dot and corner styles, add a margin, and even upload your own logo. Your changes will be reflected instantly.",
          },
          {
            q: "What is Bulk Generation?",
            a: "This feature lets you upload a CSV file to generate many QR codes at once. Your file needs a 'data' column for the QR content and an optional 'label' column for the text below the QR code. All codes will be created using your currently selected styles and downloaded as a ZIP file.",
          },
          {
            q: "How do I download the QR code?",
            a: "Below the preview, select your desired file format (PNG, JPEG, etc.) and click the 'Download' button. If you've added a text label, it will be included in PNG, JPEG, and WEBP downloads.",
          },
          {
            q: "Why is my text label not in the SVG download?",
            a: "Adding external elements like styled text to SVG files is complex. To ensure SVG validity and simplicity, the text label feature is currently only available for raster image formats (PNG, JPEG, WEBP).",
          },
        ].map((item) => (
          <div key={item.q}>
            <h4 className="font-semibold text-[var(--theme-text-primary)] mb-1">
              {item.q}
            </h4>
            <p className="text-sm text-[var(--theme-text-secondary)]">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </Card>
  </PageWrapper>
);

const SettingsPage = () => {
  const { theme, toggleTheme } = useAppContext();
  return (
    <PageWrapper title="Settings">
      <Card title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-[var(--theme-text-primary)]">
              Interface Theme
            </h4>
            <p className="text-sm text-[var(--theme-text-secondary)]">
              Switch between light and dark mode.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-[var(--theme-bg-secondary)] hover:bg-[var(--theme-bg-tertiary)] transition-all-theme text-[var(--theme-text-secondary)] group border border-[var(--theme-border-tertiary)] shadow-[var(--theme-shadow-sm)]"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}{" "}
            <span className="text-sm font-medium capitalize">
              {theme === "light" ? "Dark" : "Light"} Mode
            </span>
          </button>
        </div>
      </Card>
      <Card title="Account" className="mt-6">
        <p className="text-sm text-[var(--theme-text-secondary)]">
          Account settings are not available in this version.
        </p>
      </Card>
    </PageWrapper>
  );
};

const pageComponents: { [key: string]: React.FC } = {
  generator: QRGeneratorPage,
  about: AboutPage,
  help: HelpPage,
  settings: SettingsPage,
};

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}
interface ToastProps extends ToastItem {
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const iconMap = {
    success: (
      <CheckCircle size={20} className="text-[var(--theme-toast-text-color)]" />
    ),
    error: (
      <AlertTriangle
        size={20}
        className="text-[var(--theme-toast-text-color)]"
      />
    ),
    info: <Info size={20} className="text-[var(--theme-toast-text-color)]" />,
  };
  const bgColorVar =
    type === "success"
      ? "var(--theme-toast-success-bg)"
      : type === "error"
      ? "var(--theme-toast-error-bg)"
      : "var(--theme-toast-info-bg)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      style={{
        backgroundColor: bgColorVar,
        color: "var(--theme-toast-text-color)",
      }}
      className={`flex items-center py-3 px-4 rounded-lg shadow-[var(--theme-shadow-lg)] min-w-[280px]`}
    >
      <div className="mr-3 flex-shrink-0">{iconMap[type]}</div>
      <span className="flex-grow text-sm font-medium">{message}</span>
      <button
        onClick={() => onDismiss(id)}
        className="ml-2.5 p-1 rounded-full hover:bg-black/15 transition-all-theme"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

const ToastContainer: React.FC<{
  toasts: Array<ToastItem>;
  onDismiss: (id: number) => void;
}> = ({ toasts, onDismiss }) => (
  <div className="fixed top-5 right-5 z-[1000] space-y-2.5">
    <AnimatePresence initial={false}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </AnimatePresence>
  </div>
);

const Sidebar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    currentPage,
    setCurrentPage,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useAppContext();
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setIsMobileMenuOpen(false);
    document.body.addEventListener("keydown", closeOnEscapeKey);
    return () => document.body.removeEventListener("keydown", closeOnEscapeKey);
  }, [setIsMobileMenuOpen]);

  const sidebarAnimationState = isDesktop
    ? "open"
    : isMobileMenuOpen
    ? "open"
    : "closed";

  return (
    <>
      {!isDesktop && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-[16px] left-4 z-[900] p-2.5 rounded-lg bg-[var(--theme-bg-primary)] text-[var(--theme-text-secondary)] shadow-[var(--theme-shadow-md)] hover:bg-[var(--theme-bg-tertiary)] transition-all-theme"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      )}

      <AnimatePresence>
        {isMobileMenuOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[950]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        key="sidebar-motion"
        initial={false}
        animate={sidebarAnimationState}
        variants={{
          open: {
            x: 0,
            transition: { type: "spring", stiffness: 330, damping: 33 },
          },
          closed: {
            x: "-100%",
            transition: { type: "spring", stiffness: 330, damping: 33 },
          },
        }}
        className={`fixed top-0 left-0 h-full w-[var(--theme-sidebar-width)] bg-[var(--theme-bg-primary)] text-[var(--theme-text-primary)] border-r border-[var(--theme-border-primary)] flex flex-col z-[960] md:sticky md:translate-x-0 md:shadow-none shadow-xl md:flex-shrink-0`}
      >
        <div className="h-[var(--theme-header-height)] px-4 border-b border-[var(--theme-border-primary)] flex items-center justify-between shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(DEFAULT_PAGE);
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center space-x-2.5 group"
          >
            <div className="p-2 bg-[var(--theme-accent-primary)] rounded-lg flex items-center justify-center w-9 h-9">
              <QrCode
                size={18}
                className="text-[var(--theme-accent-primary-text)]"
              />
            </div>
            <h1 className="text-lg font-semibold text-[var(--theme-text-primary)] tracking-tight">
              {APP_NAME}
            </h1>
          </a>
          {!isDesktop && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)]"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          )}
        </div>

        <nav className="flex-grow p-3.5 space-y-1.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <a
              key={item.name}
              href={`#${item.path}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(item.path);
                setIsMobileMenuOpen(false);
              }}
              className={`relative group flex items-center px-3.5 py-2.5 pl-4 rounded-lg transition-all-theme text-sm font-medium
             ${
               currentPage === item.path
                 ? "bg-[var(--theme-accent-primary)] text-[var(--theme-accent-primary-text)] shadow-[var(--theme-shadow-md)]"
                 : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--theme-text-primary)]"
             }`}
            >
              {currentPage === item.path && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-[-12px] top-0 bottom-0 w-1.5 bg-[var(--theme-accent-primary)] rounded-r-lg"
                />
              )}
              <div className="flex items-center space-x-3 z-10">
                <item.icon
                  size={18}
                  className={`${
                    currentPage === item.path
                      ? "text-[var(--theme-accent-primary-text)]"
                      : "text-[var(--theme-text-tertiary)] group-hover:text-[var(--theme-text-secondary)]"
                  }`}
                />
                <span> {item.name} </span>
              </div>
            </a>
          ))}
        </nav>

        <div className="p-3.5 border-t border-[var(--theme-border-primary)] shrink-0">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg bg-[var(--theme-bg-primary)] hover:bg-[var(--theme-bg-tertiary)] transition-all-theme text-[var(--theme-text-secondary)] group border border-[var(--theme-border-tertiary)] shadow-[var(--theme-shadow-sm)]"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}{" "}
            <span className="text-sm font-medium">Switch Theme</span>
          </button>
          <p className="mt-3 text-center text-xs text-[var(--theme-text-tertiary)]">
            &copy; {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
      </motion.aside>
    </>
  );
};

const Header: React.FC = () => {
  const { setShowShareModal } = useAppContext();

  return (
    <header className="bg-[var(--theme-bg-primary)] text-[var(--theme-text-primary)] border-b border-[var(--theme-border-primary)] sticky top-0 z-[800] h-[var(--theme-header-height)] flex items-center shrink-0">
      <div className="px-4 sm:px-6 w-full flex items-center justify-end">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2.5 rounded-full text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--theme-accent-primary)] transition-all-theme"
            aria-label="Share"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

const MainContent: React.FC = () => {
  const { currentPage } = useAppContext();
  const PageComponent =
    pageComponents[currentPage] ||
    (() => (
      <PageWrapper title="404 - Page Not Found">
        <Card>
          <p>The page you are looking for does not exist.</p>
        </Card>
      </PageWrapper>
    ));
  return (
    <main className="flex-1 overflow-y-auto bg-[var(--theme-content-area-bg)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
          className="h-full"
        >
          <PageComponent />
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "sm",
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`bg-[var(--theme-bg-primary)] rounded-xl shadow-[var(--theme-shadow-lg)] w-full ${sizeClasses[size]} border border-[var(--theme-border-primary)]`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--theme-border-primary)]">
              <h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] transition-all-theme"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ShareModal: React.FC = () => {
  const { showShareModal, setShowShareModal, showToast } = useAppContext();
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl).then(
      () => {
        showToast("Link copied to clipboard!", "success");
        setShowShareModal(false);
      },
      () => {
        showToast("Failed to copy link.", "error");
      }
    );
  };

  const shareOptions = [
    {
      name: "Copy Link",
      icon: Copy,
      action: copyToClipboard,
      color: "text-[var(--theme-text-secondary)]",
    },
    {
      name: "Twitter",
      icon: Twitter,
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            currentUrl
          )}&text=Create amazing QR codes with QR Nexus!`,
          "_blank"
        );
        setShowShareModal(false);
      },
      color: "text-sky-500 dark:text-sky-400",
    },
    {
      name: "Facebook",
      icon: Facebook,
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            currentUrl
          )}`,
          "_blank"
        );
        setShowShareModal(false);
      },
      color: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <Modal
      isOpen={showShareModal}
      onClose={() => setShowShareModal(false)}
      title="Share this page"
    >
      <div className="grid grid-cols-3 gap-4 mb-4">
        {shareOptions.map((opt) => (
          <button
            key={opt.name}
            onClick={opt.action}
            title={opt.name}
            className={`flex flex-col items-center justify-center space-y-2 p-3 rounded-lg bg-[var(--theme-bg-secondary)] hover:bg-[var(--theme-bg-tertiary)] transition-all-theme border border-[var(--theme-border-tertiary)] aspect-square`}
          >
            <opt.icon size={24} className={`${opt.color}`} />
            <span className="text-xs text-[var(--theme-text-secondary)]">
              {opt.name}
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
};

const BulkGenerateModal: React.FC = () => {
  const {
    showBulkModal,
    setShowBulkModal,
    showToast,
    setShowDownloadZipModal,
    setZipUrl,
    qrOptions,
    logo,
    downloadSize,
    colorType,
    gradient,
    textColor,
    textMargin,
    textFontSize,
    textFontFamily,
    // UPDATED: Use fontWeight
    fontWeight,
    isTextItalic,
    textBackgroundColor,
  } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const resetModal = () => {
    setFile(null);
    setIsProcessing(false);
    setProgress("");
    setShowBulkModal(false);
  };

  const handleGenerate = () => {
    if (!file) {
      showToast("Please select a CSV file.", "error");
      return;
    }
    setIsProcessing(true);
    setProgress("Reading CSV file...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: ParseResult<any>) => {
        const data = results.data;
        if (!results.meta.fields || !results.meta.fields.includes("data")) {
          showToast("CSV must have a 'data' header.", "error");
          setIsProcessing(false);
          return;
        }

        const zip = new JSZip();

        const canvasToBlob = (
          canvas: HTMLCanvasElement
        ): Promise<Blob | null> => {
          return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/png");
          });
        };

        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          if (!row.data) continue;

          setProgress(`Generating QR ${i + 1} of ${data.length}...`);

          let rowOptions = { ...qrOptions };
          if (row.dotType)
            rowOptions.dotsOptions = {
              ...rowOptions.dotsOptions,
              type: row.dotType,
            };
          if (row.eyeFrameType)
            rowOptions.cornersSquareOptions = {
              ...rowOptions.cornersSquareOptions,
              type: row.eyeFrameType,
            };
          if (row.eyeBallType)
            rowOptions.cornersDotOptions = {
              ...rowOptions.cornersDotOptions,
              type: row.eyeBallType,
            };
          if (row.bgColor)
            rowOptions.backgroundOptions = {
              ...rowOptions.backgroundOptions,
              color: row.bgColor,
            };

          let foregroundOptions: Partial<QRCodeStylingOptions> = {};
          if (row.gradientStart && row.gradientEnd) {
            const rowGradient = {
              type: (row.gradientType || "linear") as "linear" | "radial",
              rotation: parseInt(row.gradientRotation) || 0,
              colorStops: [
                { offset: 0, color: row.gradientStart },
                { offset: 1, color: row.gradientEnd },
              ],
            };
            foregroundOptions = {
              dotsOptions: { gradient: rowGradient },
              cornersSquareOptions: { gradient: rowGradient },
              cornersDotOptions: { gradient: rowGradient },
            };
          } else if (row.fgColor) {
            foregroundOptions = {
              dotsOptions: { color: row.fgColor },
              cornersSquareOptions: { color: row.eyeFrameColor || row.fgColor },
              cornersDotOptions: { color: row.eyeBallColor || row.fgColor },
            };
          } else if (colorType === "gradient") {
            foregroundOptions = {
              dotsOptions: { gradient },
              cornersSquareOptions: { gradient },
              cornersDotOptions: { gradient },
            };
          }

          const finalOptions: QRCodeStylingOptions = {
            ...rowOptions,
            ...foregroundOptions,
            width: downloadSize,
            height: downloadSize,
            image: logo || undefined,
            data: row.data,
          };

          const tempQr = new QRCodeStyling(finalOptions);
          const rawData = await tempQr.getRawData("png");

          if (!rawData) continue;

          let finalBlob: Blob | null = rawData as Blob;
          const label = row.label || "";

          if (label.trim()) {
            const localTextColor = row.labelColor || textColor;
            const localTextMargin = parseInt(row.labelMargin) || textMargin;
            const localTextSize = parseInt(row.labelSize) || textFontSize;
            const localFont = row.labelFont || textFontFamily;
            // UPDATED: Check for labelWeight in CSV or use global fontWeight
            const localFontWeight = row.labelWeight || fontWeight;
            const localItalic = row.labelItalic
              ? row.labelItalic === "true"
              : isTextItalic;
            const localBgColor = row.labelBgColor || textBackgroundColor;

            const url = URL.createObjectURL(rawData as Blob);
            const img = await new Promise<HTMLImageElement>(
              (resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = url;
              }
            );
            URL.revokeObjectURL(url);

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const scaleFactor = downloadSize / (qrOptions.width || 300);
              const scaledFontSize = localTextSize * scaleFactor;
              const scaledTextMargin = localTextMargin * scaleFactor;

              // UPDATED: Use localFontWeight
              const fontVariant = localItalic ? "italic" : "normal";
              const font = `${fontVariant} ${localFontWeight} ${scaledFontSize}px ${localFont}`;
              ctx.font = font;

              const textMetrics = ctx.measureText(label);
              const textHeight =
                textMetrics.actualBoundingBoxAscent +
                textMetrics.actualBoundingBoxDescent;
              const backgroundVPadding = localBgColor ? 10 * scaleFactor : 0;

              canvas.width = img.width;
              canvas.height =
                img.height +
                scaledTextMargin +
                textHeight +
                backgroundVPadding * 2;

              if (finalOptions.backgroundOptions?.color) {
                ctx.fillStyle = finalOptions.backgroundOptions.color;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }

              ctx.drawImage(img, 0, 0);

              if (localBgColor) {
                ctx.fillStyle = localBgColor;
                ctx.fillRect(
                  0,
                  img.height + scaledTextMargin,
                  canvas.width,
                  textHeight + backgroundVPadding * 2
                );
              }

              ctx.font = font;
              ctx.fillStyle = localTextColor;
              ctx.textAlign = "center";
              ctx.fillText(
                label,
                canvas.width / 2,
                img.height +
                  scaledTextMargin +
                  backgroundVPadding +
                  textMetrics.actualBoundingBoxAscent
              );

              finalBlob = await canvasToBlob(canvas);
            }
          }

          if (finalBlob) {
            const fileName =
              label.replace(/[^a-z0-9]/gi, "_").toLowerCase() ||
              `qr_code_${i + 1}`;
            zip.file(`${fileName}.png`, finalBlob);
          }
        }

        setProgress("Creating ZIP file...");
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        setZipUrl(url);
        resetModal();
        setShowDownloadZipModal(true);
        showToast("Bulk generation complete!", "success");
      },
      error: (error: Error) => {
        showToast(`CSV parsing error: ${error.message}`, "error");
        setIsProcessing(false);
      },
    });
  };

  return (
    <Modal
      isOpen={showBulkModal}
      onClose={resetModal}
      title="Bulk QR Code Generation"
      size="md"
    >
      {isProcessing ? (
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <Loader size={48} className="animate-spin-slow" />
          <p className="font-semibold text-lg">{progress}</p>
          <p className="text-sm text-[var(--theme-text-secondary)]">
            Please wait, this may take a moment...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[var(--theme-text-secondary)]">
            Upload a CSV file. It must have a `data` column. You can add
            optional columns for per-row styling (e.g., `label`, `fgColor`,
            `bgColor`, `gradientStart`, `dotType`, `labelColor`, `labelSize`,
            `labelWeight`).
          </p>
          <div>
            <label
              htmlFor="csv-upload"
              className="w-full flex flex-col items-center justify-center cursor-pointer p-6 text-sm font-medium rounded-lg border-2 border-dashed border-[var(--theme-border-secondary)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)] hover:border-[var(--theme-accent-primary)] transition-all-theme"
            >
              {file ? (
                <>
                  <FileText size={32} className="mb-2" />
                  <span>{file.name}</span>
                </>
              ) : (
                <>
                  <Upload size={32} className="mb-2" />
                  <span>Click to select a .CSV file</span>
                </>
              )}
            </label>
            <input
              type="file"
              id="csv-upload"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={resetModal}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--theme-border-secondary)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)] transition-all-theme"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!file}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--theme-accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate ZIP
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

const DownloadZipModal: React.FC = () => {
  const { showDownloadZipModal, setShowDownloadZipModal, zipUrl, setZipUrl } =
    useAppContext();

  const handleClose = () => {
    if (zipUrl) {
      URL.revokeObjectURL(zipUrl);
    }
    setZipUrl("");
    setShowDownloadZipModal(false);
  };

  return (
    <Modal
      isOpen={showDownloadZipModal}
      onClose={handleClose}
      title="Download Ready"
    >
      <div className="text-center space-y-6 p-4">
        <CheckCircle
          size={56}
          className="mx-auto text-[var(--theme-accent-secondary)]"
        />
        <h4 className="text-xl font-bold">Your ZIP file is ready!</h4>
        <p className="text-sm text-[var(--theme-text-secondary)]">
          Click the button below to download the ZIP archive containing all your
          generated QR codes.
        </p>
        <a
          href={zipUrl}
          download="qr-nexus-bulk.zip"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-md font-semibold rounded-lg bg-[var(--theme-accent-primary)] text-[var(--theme-accent-primary-text)] hover:opacity-90 transition-opacity"
        >
          <Download size={20} /> Download ZIP
        </a>
      </div>
    </Modal>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">(DEFAULT_THEME);
  const [currentPage, _setCurrentPage] = useState<string>(DEFAULT_PAGE);
  const [toasts, setToasts] = useState<Array<ToastItem>>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDownloadZipModal, setShowDownloadZipModal] = useState(false);
  const [zipUrl, setZipUrl] = useState("");


  const [data, setData] = useState("Enter your data here...");

  const [qrOptions, setQrOptions] = useState<QRCodeStylingOptions>({
    width: 300,
    height: 300,
    margin: 10,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 10,
      crossOrigin: "anonymous",
    },
    dotsOptions: { type: "square", color: "#000000" },
    backgroundOptions: { color: "#ffffff" },
    cornersSquareOptions: { type: "square", color: "#000000" },
    cornersDotOptions: { type: "square", color: "#000000" },
  });
  const [logo, setLogo] = useState<string | null>(null);

  const [textLabel, setTextLabel] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [textMargin, setTextMargin] = useState(10);
  const [textFontSize, setTextFontSize] = useState(16);
  const [textFontFamily, setTextFontFamily] = useState("Lexend");
  // FIXED: Replaced isTextBold with fontWeight for more options
  const [fontWeight, setFontWeight] = useState("700"); // 400=normal, 700=bold, 900=extra-bold
  const [isTextItalic, setIsTextItalic] = useState(false);
  const [textBackgroundColor, setTextBackgroundColor] = useState<string | null>(
    null
  );
  const [downloadSize, setDownloadSize] = useState(1000);
  const [colorType, setColorType] = useState<"single" | "gradient">("single");
  const [gradient, setGradient] = useState<Gradient>({
    type: "linear",
    rotation: 0,
    colorStops: [
      { offset: 0, color: "#000000" },
      { offset: 1, color: "#000000" },
    ],
  });

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem("app-theme") as "light" | "dark";
    if (savedTheme) setTheme(savedTheme);

    const hashPage = window.location.hash.substring(1);
    const validPages = Object.keys(pageComponents);
    if (hashPage && validPages.includes(hashPage)) {
      _setCurrentPage(hashPage);
    } else {
      window.location.hash = DEFAULT_PAGE;
      _setCurrentPage(DEFAULT_PAGE);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      document.documentElement.className = theme;
      localStorage.setItem("app-theme", theme);
    }
  }, [theme, isMounted]);

  const setCurrentPage = useCallback((page: string) => {
    _setCurrentPage(page);
    window.location.hash = page;
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const newPage = window.location.hash.substring(1) || DEFAULT_PAGE;
      const validPages = Object.keys(pageComponents);
      _setCurrentPage(validPages.includes(newPage) ? newPage : DEFAULT_PAGE);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const toggleTheme = useCallback(
    () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
    []
  );
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToasts((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), message, type },
      ]);
    },
    []
  );
  const dismissToast = useCallback(
    (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  const appContextValue: AppContextType = {
    theme,
    toggleTheme,
    showToast,
    currentPage,
    setCurrentPage,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showShareModal,
    setShowShareModal,
    showBulkModal,
    setShowBulkModal,
    showDownloadZipModal,
    setShowDownloadZipModal,
    zipUrl,
    setZipUrl,
    qrOptions,
    setQrOptions,
    data, // Pass persistent data
    setData, // Pass setter for persistent data
    logo,
    setLogo,
    textLabel,
    setTextLabel,
    textColor,
    setTextColor,
    textMargin,
    setTextMargin,
    textFontSize,
    setTextFontSize,
    textFontFamily,
    setTextFontFamily,
    fontWeight, // Pass fontWeight
    setFontWeight, // Pass fontWeight setter
    isTextItalic,
    setIsTextItalic,
    textBackgroundColor,
    setTextBackgroundColor,
    downloadSize,
    setDownloadSize,
    colorType,
    setColorType,
    gradient,
    setGradient,
  };

  if (!isMounted) return null;

  return (
    <AppContext.Provider value={appContextValue}>
      <link rel="stylesheet" href={FONT_URL} />
      <GlobalStyles />
      <div
        className={`flex h-screen antialiased selection:bg-[var(--theme-accent-primary)] selection:text-[var(--theme-accent-primary-text)]`}
        style={{ fontFamily: "var(--theme-font-family)" }}
      >
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <MainContent />
        </div>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <ShareModal />
        <BulkGenerateModal />
        <DownloadZipModal />
      </div>
    </AppContext.Provider>
  );
};

export default App;