const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function printElementContent(
  element: HTMLElement,
  title = "Report Print",
): void {
  const printWindow = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=1000,height=800",
  );

  if (!printWindow) {
    window.print();
    return;
  }

  const styles = Array.from(
    document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
      'link[rel="stylesheet"], style',
    ),
  )
    .map((node) => node.outerHTML)
    .join("\n");

  const safeTitle = escapeHtml(title);

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    ${styles}
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #fff;
      }
    </style>
  </head>
  <body>${element.innerHTML}</body>
</html>`);
  printWindow.document.close();

  let hasPrinted = false;
  const executePrint = () => {
    if (hasPrinted || printWindow.closed) return;
    hasPrinted = true;
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  printWindow.addEventListener("load", executePrint, { once: true });
  window.setTimeout(executePrint, 350);
}

