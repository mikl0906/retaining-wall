import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Download, Printer, Upload } from "lucide-react";

export function Menu() {
  return (
    <ButtonGroup>
      <Button variant="outline">
        <Upload />
        Open
      </Button>
      <Button variant="outline">
        <Download />
        Save
      </Button>
      <Button variant="outline">
        <Printer />
        Print
      </Button>
    </ButtonGroup>
  );
}
