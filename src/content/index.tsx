import ReactDOM from "react-dom/client";

import HighlightBrackets from "./HighlightBrackets";
import HighlightParagraph from "./HightlightParagraph";
import HoverTooltip from "./HoverTooltip";
import ExternalLinkPopover from "./ExternalLinkPopover/ExternalLinkPopover";

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
      <HighlightBrackets />
      <ExternalLinkPopover />

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
