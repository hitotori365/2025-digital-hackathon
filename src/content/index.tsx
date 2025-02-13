import ReactDOM from "react-dom/client";

import HighlightBrackets from "./HighlightBrackets";
import HighlightParagraph from "./HightlightParagraph";
import HoverTooltip from "./HoverTooltip";
// import HoverPopup from "./HoverPopup";
import LawPopover from "./LawPopover";

function initialize() {
  const rootDiv = document.createElement("div");
  rootDiv.id = "extension-root";
  document.body.appendChild(rootDiv);

  const root = ReactDOM.createRoot(rootDiv);
  root.render(
    <>
      <LawPopover />
      <HighlightBrackets />
      <HighlightParagraph />
      <HoverTooltip />
      {/* <HoverPopup /> */}
    </>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
