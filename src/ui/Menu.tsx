import { Button } from "@/components/ui/button";
import { Download, Monitor, Moon, Printer, Sun, Upload } from "lucide-react";
import { generateReport } from "@/reports";
import { useModel } from "@/modelStore";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

export function Menu() {
  const { theme, setTheme } = useTheme();
  const model = useModel();

  const handleOpen = () => {
    toast.error("Not implemented yet");
  };

  const handleSave = () => {
    toast.error("Not implemented yet");
  };

  const handlePrint = () => {
    generateReport(model);
  };

  return (
    <div className="flex gap-2 min-w-0">
      <Button variant="outline" onClick={handleOpen}>
        <Upload />
        Open
      </Button>
      <Button variant="outline" onClick={handleSave}>
        <Download />
        Save
      </Button>
      <Button variant="outline" onClick={handlePrint}>
        <Printer />
        Print
      </Button>
      <ToggleGroup
        type="single"
        variant="outline"
        value={theme}
        onValueChange={(v) => {
          if (v !== "light" && v !== "dark" && v !== "system") return;
          setTheme(v);
        }}
      >
        <ToggleGroupItem
          value="light"
          size="sm"
          aria-label="Toggle light theme"
          title="Light theme"
        >
          <Sun />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="dark"
          size="sm"
          aria-label="Toggle dark theme"
          title="Dark theme"
        >
          <Moon />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="system"
          size="sm"
          aria-label="Toggle system theme"
          title="System theme"
        >
          <Monitor />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
