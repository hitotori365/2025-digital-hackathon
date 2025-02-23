import ReactDOM from "react-dom/client";

import UnderlineBrackets from "./UnderlineBrackets";
import HoverTooltip from "./HoverTooltip";
import ExternalLinkPopover from "./ExternalLinkPopover/ExternalLinkPopover";
import AbbreviationLinker from "./AbbreviationLinker";
import DecorateLawTitles from "./DecorateLawTitles/DecorateLawTitles";

function initialize() {
  const rootDiv = document.createElement("div");
  rootDiv.id = "extension-root";
  document.body.appendChild(rootDiv);

  const root = ReactDOM.createRoot(rootDiv);
  root.render(
    <>
      <UnderlineBrackets />
      <AbbreviationLinker />
      <DecorateLawTitles />
      <ExternalLinkPopover />
      <HoverTooltip />
    </>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
