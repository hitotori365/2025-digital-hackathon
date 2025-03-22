import React, { useEffect } from "react";

type TooltipState = {
  element: HTMLElement;
  timeout: NodeJS.Timeout;
};

class Tooltip {
  private tooltipEl!: HTMLElement;
  private link: HTMLAnchorElement;
  private showTimeout: NodeJS.Timeout | null = null;

  constructor(link: HTMLAnchorElement) {
    this.link = link;
    this.createTooltip();
    this.setupEventListeners();
  }

  static removeExistingTooltips(): void {
    document.querySelectorAll(".hover-tooltip").forEach((t) => t.remove());
  }

  private createTooltip(): void {
    this.tooltipEl = document.createElement("div");
    this.tooltipEl.className = "hover-tooltip";
    this.tooltipEl.id = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    this.setupHoverEvents();
  }

  private setupHoverEvents(): void {
    this.link.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
    this.link.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
  }

  private handleMouseEnter(): void {
    this.showTimeout = setTimeout(this.showTooltip.bind(this), 300);
  }

  private handleMouseLeave(): void {
    if (!this.showTimeout) return;
    clearTimeout(this.showTimeout);
    this.showTimeout = null;
  }

  private showTooltip(): void {
    Tooltip.removeExistingTooltips();
    if (document.getElementById(this.tooltipEl.id)) return;

    const targetId = this.getTargetId();
    if (!targetId) return;

    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    const clone = targetElement.cloneNode(true) as HTMLElement;
    this.tooltipEl.innerHTML = "";
    this.tooltipEl.appendChild(clone);

    document.body.appendChild(this.tooltipEl);
    this.adjustPosition();
  }

  private adjustPosition(): void {
    const rect = this.link.getBoundingClientRect();
    this.tooltipEl.style.position = "absolute";
    this.tooltipEl.style.top = `${rect.bottom + window.scrollY + 5}px`;
    this.tooltipEl.style.left = `${rect.left + window.scrollX}px`;
  }

  private getTargetId(): string | null {
    const href = this.link.getAttribute("href");
    if (!href?.startsWith("#")) return null;
    return href.substring(1);
  }
}

function setupTooltip(link: HTMLAnchorElement): void {
  if (link.dataset.tooltipInitialized === "true") return;

  const href = link.getAttribute("href");
  if (!href?.startsWith("#")) return;

  link.dataset.tooltipInitialized = "true";
  new Tooltip(link);
}

function setupTooltipObserver(): MutationObserver {
  const processLinks = (element: Element) => {
    const links = element.querySelectorAll("a[href^='#']");
    links.forEach(link => setupTooltip(link as HTMLAnchorElement));
  };

  processLinks(document.body);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return;
        processLinks(node);
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
}

const HoverTooltip: React.FC = () => {
  useEffect(() => {
    const observer = setupTooltipObserver();
    return () => {
      Tooltip.removeExistingTooltips();
      observer.disconnect();
    };
  }, []);

  return null;
};

export default HoverTooltip;
