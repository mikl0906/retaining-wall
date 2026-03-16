import { Button } from "@/components/ui/button";
import { Download, Monitor, Moon, Sun, Upload } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";

export function Menu() {
  const { theme, setTheme } = useTheme();

  const handleOpen = () => {
    toast.error("Not implemented yet");
  };

  const handleSave = () => {
    toast.error("Not implemented yet");
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
      <ToggleGroup
        size="sm"
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
          aria-label="Toggle light theme"
          title="Light theme"
        >
          <Sun />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="dark"
          aria-label="Toggle dark theme"
          title="Dark theme"
        >
          <Moon />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="system"
          aria-label="Toggle system theme"
          title="System theme"
        >
          <Monitor />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
