import { ThemeProvider } from "./components/theme-provider";
import { ModelCanvas } from "./ModelCanvas";

export function App() {
  return (
    <ThemeProvider>
      <div className="absolute w-full h-full">
        <ModelCanvas />
      </div>
    </ThemeProvider>
  );
}
