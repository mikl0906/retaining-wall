import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useRef, useState } from "react";

interface NumberInputProps {
  position: THREE.Vector3;
  value: number | string;
  unit?: string;
  onChange?: (value: number) => void;
}

export function NumberInput({
  position,
  value,
  unit,
  onChange,
}: NumberInputProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEditing() {
    setInputValue(String(value));
    setError(false);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const num = Number.parseFloat(inputValue);
    if (!Number.isFinite(num)) {
      setError(true);
      return;
    }
    setEditing(false);
    onChange?.(num);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  }

  return (
    <Html position={position} center>
      {editing ? (
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(false);
          }}
          onKeyDown={handleKeyDown}
          onBlur={commitEdit}
          className={`w-16 min-w-0 px-2 bg-background/50 rounded-md text-center outline-none border ${error ? "border-red-500" : "border-magenta-400"}`}
        />
      ) : (
        <div
          className={`px-2 rounded-md border text-nowrap ${onChange ? "cursor-pointer bg-background/60" : "bg-background/20"}`}
          onClick={onChange ? startEditing : undefined}
        >
          {value} <span className="opacity-60">{unit}</span>
        </div>
      )}
    </Html>
  );
}
