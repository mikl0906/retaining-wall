import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Download, Printer, Upload } from "lucide-react";
import { generateReport } from "@/reports";
import { useModel } from "@/modelStore";

export function Menu() {
  const model = useModel();

  const handlePrint = () => {
    generateReport(model);
  };

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
      <Button variant="outline" onClick={handlePrint}>
        <Printer />
        Print
      </Button>
    </ButtonGroup>
  );
}
