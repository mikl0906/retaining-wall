import { useState } from "react";
import { Input } from "@/components/ui/input";

interface NumberFieldProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "value" | "onChange" | "type"
  > {
  value: number;
  min?: number;
  max?: number;
  onValueChange: (value: number) => void;
}

// Numeric input that only commits finite, in-range values. Invalid input
// (e.g. an emptied field, which Number() would read as 0) stays a local
// draft and the display reverts to the committed value on blur.
export function NumberField({
  value,
  min,
  max,
  onValueChange,
  ...props
}: NumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <Input
      type="number"
      min={min}
      max={max}
      value={draft ?? String(value)}
      onChange={(e) => {
        const text = e.target.value;
        setDraft(text);
        const num = Number(text);
        if (text.trim() === "" || !Number.isFinite(num)) return;
        if (min !== undefined && num < min) return;
        if (max !== undefined && num > max) return;
        onValueChange(num);
      }}
      onBlur={() => setDraft(null)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape") setDraft(null);
      }}
      {...props}
    />
  );
}
