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
      {/* WARNING: 
          HighlightBrackets と ExternalLinkPopover の順番を変えるとバグが発生する
          WHY:
          HighlightParagraph が innerHTML を変更するため、ExternalLinkPopoverが付与したイベントリスナーを削除してしまう
          HighlightBrackets よりも後に呼び出さないいと上手く動作しないことがある
       */}
      <HoverTooltip />
      <UnderlineBrackets />
      <ExternalLinkPopover />
      <AbbreviationLinker />
      <DecorateLawTitles />
      <ExternalLinkPopover />
    </>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
