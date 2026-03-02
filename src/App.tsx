import { ThemeProvider } from "./components/theme-provider";
import { ModelCanvas } from "./model/ModelCanvas";
import { Menu } from "./ui/Menu";
import { MaterialsCard } from "./ui/MaterialsCard";
import { LoadsCard } from "./ui/LoadsCard";
import { ResultsCard } from "./ui/ResultsCard";

export function App() {
  return (
    <ThemeProvider>
      <div className="absolute w-full h-full">
        <ModelCanvas />
      </div>
      <div className="absolute top-4 left-4 min-w-80 flex flex-col gap-4">
        <Menu />
        <MaterialsCard />
        <LoadsCard />
        <ResultsCard />
      </div>
    </ThemeProvider>
  );
}
