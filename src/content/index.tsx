import ReactDOM from "react-dom/client";

import UnderlineBrackets from "./UnderlineBrackets";
import HighlightParagraph from "./HightlightParagraph";
import HoverTooltip from "./HoverTooltip";
import ExternalLinkPopover from "./ExternalLinkPopover/ExternalLinkPopover";
import AbbreviationLinker from "./AbbreviationLinker";

function initialize() {
  const rootDiv = document.createElement("div");
  rootDiv.id = "extension-root";
  document.body.appendChild(rootDiv);

  const root = ReactDOM.createRoot(rootDiv);
  root.render(
    <>
      <AbbreviationLinker />
      <ExternalLinkPopover />
      <UnderlineBrackets />
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
