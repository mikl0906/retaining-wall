import { useRef, useEffect } from "react";
import { useModel } from "../modelStore";
import { generateReport, getEta } from "../reports";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function ReportPreview() {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const model = useModel();

  useEffect(() => {
    if (!frameRef.current) return;

    const updateFrame = async () => {
      const eta = await getEta();
      const template = await fetch("/report.eta").then((res) => res.text());
      const html = eta.renderString(template, { model: model });

      frameRef.current!.srcdoc = html;
    };
    updateFrame();
  }, [frameRef, model]);

  const handlePrint = () => {
    generateReport(model);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="m-2">
        <Button variant="outline" onClick={handlePrint}>
          <Printer />
          Print
        </Button>
      </div>
      <iframe ref={frameRef} className="flex-1 w-full bg-white" />
    </div>
  );
}
