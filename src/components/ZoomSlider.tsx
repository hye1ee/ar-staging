import React from "react";

interface ZoomSliderProps {
  value: number;
  onChange: (val: number) => void;
}

export default function ZoomSlider(props: ZoomSliderProps) {
  return (
    <div onPointerDown={(e) => e.stopPropagation()}>
      <div style={{ width: "100%", height: "90vh" }} />
      <div style={{ padding: "10px", textAlign: "center" }}>
        <label htmlFor="zoomSlider">
          Camera Zoom: {props.value.toFixed(2)}
        </label>
        <input
          id="zoomSlider"
          type="range"
          min="30" // 최소 줌
          max="100" // 최대 줌
          step="1" // 줌 단계
          value={props.value}
          onChange={(evt) => {
            props.onChange(parseFloat(evt.target.value));
          }}
          style={{ width: "80%" }}
        />
      </div>
    </div>
  );
}
