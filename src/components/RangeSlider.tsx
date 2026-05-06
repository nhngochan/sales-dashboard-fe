interface RangeSliderProps {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

export default function RangeSlider({ min, max, minLabel, maxLabel }: RangeSliderProps) {
  return (
    <div className="chart-slider">
      <span>{minLabel ?? min}</span>
      <input type="range" min={min} max={max} defaultValue={min} />
      <span>{maxLabel ?? max}</span>
    </div>
  );
}
