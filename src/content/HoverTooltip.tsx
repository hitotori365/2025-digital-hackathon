import React, { useEffect } from "react";
import { createProcessLock, debounce } from "../utils/processControl";

const HoverTooltip: React.FC = () => {
  useEffect(() => {
    const hideTimeouts = new Map<string, NodeJS.Timeout>();
    const processLock = createProcessLock();
    const debouncedProcess = debounce((node: Element) => {
      processLock(async () => {
        await processMainContentLinks(node);
      });
    }, 100);

    const observer = new MutationObserver((mutations) => {
      if (mutations.length > 100) return;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            debouncedProcess(node as Element);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });

    return () => {
      hideTimeouts.forEach(timeout => clearTimeout(timeout));
      hideTimeouts.clear();
      observer.disconnect();
      const tooltips = document.querySelectorAll(".hover-tooltip");
      tooltips.forEach(tooltip => tooltip.remove());
    };
  }, []);

  return null;
};

export default HoverTooltip;
