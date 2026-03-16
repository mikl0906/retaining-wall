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

export function App() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <ThemeProvider>
      {isDesktop ? <DesktopApp /> : <MobileApp />}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}

function DesktopApp() {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="h-screen flex">
      <div className="relative flex-3">
        <div className="absolute inset-0">
          <ModelCanvas />
        </div>
        <div className="absolute top-4 left-4 min-w-80 flex flex-col gap-4">
          <Menu />
          <ModelInfoCard />
          <MaterialsCard />
          <PartialFactorsCard />
          <ResultsCard />
        </div>
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            onClick={() => setReportOpen((open) => !open)}
          >
            {reportOpen ? "Close Report" : "Open Report"}
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

const snapPoints = ["120rem", 1];

export function MobileApp() {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

  return (
    <>
      <div className="absolute w-full h-full">
        <ModelCanvas />
      </div>
      <Drawer
        open
        snapPoints={snapPoints}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
        modal={false}
      >
        <DrawerContent title="menu">
          <DrawerHeader>
            <DrawerTitle>Parameters</DrawerTitle>
            <DrawerDescription>
              Adjust the model parameters and view results.
            </DrawerDescription>
          </DrawerHeader>

          <div className="no-scrollbar flex-1 overflow-y-auto px-4">
            <div className="flex flex-col gap-4 pb-4">
              <Menu />
              <MaterialsCard />
              <PartialFactorsCard />
              <ResultsCard />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
