import { useCallback } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  /** Current range as [low, high] */
  value: [number, number];
  minLabel?: string;
  maxLabel?: string;
  onChange: (value: [number, number]) => void;
}

export default function RangeSlider({
  min,
  max,
  value,
  minLabel,
  maxLabel,
  onChange,
}: RangeSliderProps) {
  const [low, high] = value;

  // Percentage positions for the active track fill
  const range = max - min || 1;
  const lowPct = ((low - min) / range) * 100;
  const highPct = ((high - min) / range) * 100;

  const handleLow = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(e.target.value);
      // Don't allow low to exceed high
      onChange([Math.min(next, high), high]);
    },
    [high, onChange]
  );

  const handleHigh = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(e.target.value);
      // Don't allow high to go below low
      onChange([low, Math.max(next, low)]);
    },
    [low, onChange]
  );

  return (
    <div className="chart-slider">
      <span>{minLabel ?? min}</span>

      <div className="range-slider-track">
        {/* Filled portion between the two thumbs */}
        <div
          className="range-slider-fill"
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />

        {/* Low thumb */}
        <input
          type="range"
          className="range-thumb range-thumb--low"
          min={min}
          max={max}
          value={low}
          onChange={handleLow}
        />

        {/* High thumb */}
        <input
          type="range"
          className="range-thumb range-thumb--high"
          min={min}
          max={max}
          value={high}
          onChange={handleHigh}
        />
      </div>

      <span>{maxLabel ?? max}</span>
    </div>
  );
}
