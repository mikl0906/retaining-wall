import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Monitor, Moon, Sun, Upload } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { setModel, useModel } from "@/modelStore";
import { Model } from "@/types";

// lucide-react no longer ships brand icons, so the GitHub mark is inlined
function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

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
        spacing={0}
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
      <Button
        size="icon-sm"
        variant="outline"
        title="Source code on GitHub"
        nativeButton={false}
        render={
          <a
            href="https://github.com/mikl0906/retaining-wall"
            target="_blank"
            rel="noreferrer"
            aria-label="Source code on GitHub"
          />
        }
      >
        <GithubIcon />
      </Button>
    </div>
  );
}
