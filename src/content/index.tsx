import ReactDOM from "react-dom/client";

import HighlightBrackets from "./HighlightBrackets";
import HoverTooltip from "./HoverTooltip";
import ExternalLinkPopover from "./ExternalLinkPopover/ExternalLinkPopover";
import DecorateLawTitles from "./DecorateLawTitles/DecorateLawTitles";

function initialize() {
  const rootDiv = document.createElement("div");
  rootDiv.id = "extension-root";
  document.body.appendChild(rootDiv);

  const root = ReactDOM.createRoot(rootDiv);
  root.render(
    <>
      <ExternalLinkPopover />
      <HighlightBrackets />
      <DecorateLawTitles />
      <HoverTooltip />
    </>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
