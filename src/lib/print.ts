export function printElementContent(
  element: HTMLElement,
  _title = "Report Print",
): void {
  const printToken = `print-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const printAttr = "data-print-target";
  const styleEl = document.createElement("style");

  element.setAttribute(printAttr, printToken);
  styleEl.setAttribute("data-print-style", printToken);
  styleEl.textContent = `
    @media print {
      body {
        margin: 0 !important;
      }

      body * {
        visibility: hidden !important;
      }

      [${printAttr}="${printToken}"],
      [${printAttr}="${printToken}"] * {
        visibility: visible !important;
      }

      [${printAttr}="${printToken}"] {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        margin: 0 !important;
      }
    }
  `;

  document.head.appendChild(styleEl);

  let didCleanup = false;
  const cleanup = () => {
    if (didCleanup) return;
    didCleanup = true;
    element.removeAttribute(printAttr);
    styleEl.remove();
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup, { once: true });

  try {
    window.print();
  } finally {
    window.setTimeout(cleanup, 1000);
  }
}
