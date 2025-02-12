// src/content/index.tsx
import ReactDOM from "react-dom/client";

import HighlightBrackets from "./HighlightBrackets";
import HighlightParagraph from "./HightlightParagraph";
import HoverTooltip from "./HoverTooltip";

function initialize() {
  const rootDiv = document.createElement("div");
  rootDiv.id = "extension-root";
  document.body.appendChild(rootDiv);

  const root = ReactDOM.createRoot(rootDiv);
  root.render(
    <>
      <HighlightBrackets />
      <HighlightParagraph />
      <HoverTooltip />
    </>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}