import { ModelCanvas } from "./model/ModelCanvas";
import { Menu } from "./ui/Menu";
import { MaterialsCard } from "./ui/MaterialsCard";
import { LoadsCard } from "./ui/LoadsCard";
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
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
// import { ReportPreview } from "./ui/ReportPreview";

export function App() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <ThemeProvider>
      <div className="absolute w-full h-full">
        <ModelCanvas />
      </div>
      {isDesktop ? <DesktopUI /> : <MobileUI />}
      {/* <div className="absolute w-[50%] h-[50%] right-2 bottom-2">
        <ReportPreview />
      </div> */}
      <ToasterWrapper />
    </ThemeProvider>
  );
}

function DesktopUI() {
  return (
    <div className="absolute top-4 left-4 min-w-80 flex flex-col gap-4">
      <Menu />
      <MaterialsCard />
      <LoadsCard />
      <ResultsCard />
    </div>
  );
}

const snapPoints = ["120rem", 1];

export function MobileUI() {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

  return (
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
            <LoadsCard />
            <ResultsCard />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ToasterWrapper() {
  const { theme } = useTheme();
  return <Toaster richColors theme={theme} />;
}
