// Commonly Used Functions

export async function loadHeaderFooter() {
  const headerElement = document.querySelector("header");
  const footerElement = document.querySelector("footer");

  if (!headerElement) {
    console.error("Header element not found.");
    return;
  }

  try {
    const response = await fetch("/partials/header.html");

    if (!response.ok) {
      throw new Error("Failed to load header partial.");
    }

    const html = await response.text();
    headerElement.innerHTML = html;

  } catch (error) {
    console.error("Error loading header:", error);
  }

  if (!footerElement) {
    console.error("Footer element not found.");
    return;
  }

  try {
    const response = await fetch("../partials/footer.html");

    if (!response.ok) {
      throw new Error("Failed to load footer partial.");
    }

    const html = await response.text();
    headerElement.innerHTML = html;

  } catch (error) {
    console.error("Error loading footer:", error);
  }
}

