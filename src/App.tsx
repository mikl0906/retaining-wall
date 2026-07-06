import { ModelCanvas } from "./model/ModelCanvas";
import { Menu } from "./ui/Menu";
import { MaterialsCard } from "./ui/MaterialsCard";
import { PartialFactorsCard } from "./ui/PartialFactorsCard";
import { ResultsCard } from "./ui/ResultsCard";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./components/ui/drawer";
import { useMediaQuery } from "usehooks-ts";
import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import { ReportPreview } from "./ui/ReportPreview";
import { Button } from "./components/ui/button";
import { Separator } from "./components/ui/separator";
import { ModelInfoCard } from "./ui/ModelInfoCard";
import { Printer } from "lucide-react";
import { useModel } from "./modelStore";
import { generateReport } from "./reports";
import { ScrollArea } from "./components/ui/scroll-area";

export function App() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <ThemeProvider>
      {isDesktop ? <DesktopApp /> : <MobileApp />}
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}

function DesktopApp() {
  const [reportOpen, setReportOpen] = useState(false);
  const model = useModel();

  const handlePrint = () => {
    generateReport(model);
  };

  return (
    <div className="h-screen flex">
      <div className="relative flex-3">
        <div className="absolute inset-0">
          {/* w-100 card column + left-4 offset */}
          <ModelCanvas panelLeft={300} />
        </div>
        <div className="absolute top-4 left-4 bottom-4 z-50 w-100 flex flex-col gap-4">
          <Menu />
          <ScrollArea className="min-h-0 flex-1">
            {/* Cards draw their outline as a ring (box-shadow outside the
                border box); 1px padding keeps it from being clipped by the
                scroll viewport */}
            <div className="flex flex-col gap-4 p-px">
              <ModelInfoCard />
              <PartialFactorsCard />
              <MaterialsCard />
              <ResultsCard />
            </div>
          </ScrollArea>
        </div>
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <Button size="sm" variant="outline" onClick={handlePrint}>
            <Printer />
            Print Report
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setReportOpen((open) => !open)}
          >
            {reportOpen ? "Close Preview" : "Open Preview"}
          </Button>
        </div>
      </div>
      {reportOpen && (
        <>
          <Separator orientation="vertical" />
          <div className="flex-2">
            <ReportPreview />
          </div>
        </>
      )}
    </div>
  );
}

const snapPoints = ["10rem", 1];

export function MobileApp() {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);
  const model = useModel();

  return (
    <>
      <div className="absolute w-full h-full">
        {/* 10rem drawer snap covers the bottom of the screen */}
        <ModelCanvas panelBottom={160} />
      </div>
      <Drawer
        open
        snapPoints={snapPoints}
        snapPoint={snap}
        onSnapPointChange={setSnap}
        modal={false}
      >
        <DrawerContent title="menu">
          <DrawerHeader>
            <DrawerTitle>Parameters</DrawerTitle>
            <DrawerDescription>
              Adjust the model parameters and view results.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 p-4">
              <Menu />
              <ModelInfoCard />
              <PartialFactorsCard />
              <MaterialsCard />
              <ResultsCard />
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateReport(model)}
              >
                <Printer />
                Print Report
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
