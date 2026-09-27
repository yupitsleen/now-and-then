import { Button } from "../Button";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";
import type { ExportFormatId, ExportConfig } from "../../types/export";

interface ExportControlsProps {
  selectedFormat: ExportFormatId;
  onFormatChange: (format: ExportFormatId) => void;
  onExport: () => void;
  exportConfigs: ExportConfig[];
}

/**
 * Export controls for table (format dropdown + export button)
 * Shown only in expanded variant
 */
export function ExportControls({
  selectedFormat,
  onFormatChange,
  onExport,
  exportConfigs,
}: ExportControlsProps) {
  const t = useThemeClasses();
  const translate = useTranslation();

  return (
    <div className="flex items-center gap-2 mr-12">
      <select
        value={selectedFormat}
        onChange={(e) => onFormatChange(e.target.value as ExportFormatId)}
        className={`px-2 py-1 text-[10px] rounded border ${t.border.default} ${t.bg.primary} ${t.text.body} focus:outline-none focus:ring-1 focus:ring-brand transition-colors duration-200`}
        title={translate("table.selectExportFormat")}
        aria-label={translate("table.selectExportFormat")}
      >
        {exportConfigs.map((config) => (
          <option key={config.id} value={config.id}>
            {config.icon} {config.label}
          </option>
        ))}
      </select>
      <Button
        onClick={onExport}
        variant="primary"
        size="xs"
        title={`${translate("table.export")} ${exportConfigs.find(c => c.id === selectedFormat)?.label}`}
        aria-label={`${translate("table.export")} ${exportConfigs.find(c => c.id === selectedFormat)?.label}`}
        icon={
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      >
        {translate("table.export")}
      </Button>
    </div>
  );
}
