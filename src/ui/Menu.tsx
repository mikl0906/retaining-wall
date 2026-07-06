import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Monitor, Moon, Sun, Upload } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { setModel, useModel } from "@/modelStore";
import { Model } from "@/types";

export function Menu() {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.target;
    const file = input.files?.[0];
    // Reset so re-selecting the same file fires the change event again
    input.value = "";
    if (!file) return;

    let data: unknown;
    try {
      data = JSON.parse(await file.text());
    } catch {
      toast.error(`${file.name} is not a valid JSON file`);
      return;
    }

    const result = Model.safeParse(data);
    if (!result.success) {
      toast.error(`${file.name} is not a valid model file`);
      return;
    }

    setModel(result.data);
    toast.success(`Opened ${result.data.name}`);
  };

  const handleSave = () => {
    const model = useModel.getState();
    const json = JSON.stringify(model, null, 2);
    const url = URL.createObjectURL(
      new Blob([json], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    const fileName =
      model.name.replace(/[^\p{L}\p{N} _.-]/gu, "").trim() || "model";
    anchor.download = `${fileName}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`Saved ${anchor.download}`);
  };

  return (
    <div className="flex gap-2 min-w-0">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileSelected}
      />
      <Button size="sm" variant="outline" onClick={handleOpen}>
        <Upload />
        Open file
      </Button>
      <Button size="sm" variant="outline" onClick={handleSave}>
        <Download />
        Save to file
      </Button>
      <ToggleGroup
        size="sm"
        variant="outline"
        value={[theme]}
        onValueChange={(v) => {
          if (v[0] !== "light" && v[0] !== "dark" && v[0] !== "system") return;
          setTheme(v[0]);
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
