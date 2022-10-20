import React from "react";

type Props = {
  text?: string;
};

export const Image = ({ text = "sample" }: Props) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      border: "64px solid #123456",
    }}
  >
    <span style={{ fontSize: "64px", color: "#000", fontWeight: "bold" }}>
      {text}
    </span>
  </div>
);
