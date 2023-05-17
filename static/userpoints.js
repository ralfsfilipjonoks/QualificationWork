// Get the table and its headers
const table = document.getElementById("pointTable");
const headers = table.querySelectorAll("th");

// Add click event listener to each header
headers.forEach((header, index) => {
  header.addEventListener("click", () => {
    // Get the table rows
    const rows = table.querySelectorAll("tbody tr");
    // Create an array from the rows and sort it by the clicked header
    const sortedRows = Array.from(rows).sort((a, b) => {
      const aText = a
        .querySelector(`td:nth-child(${index + 1})`)
        .textContent.trim();
      const bText = b
        .querySelector(`td:nth-child(${index + 1})`)
        .textContent.trim();
      return aText.localeCompare(bText);
    });
    // Reverse the sorted array if the header is already sorted in ascending order
    if (header.classList.contains("asc")) {
      sortedRows.reverse();
      header.classList.remove("asc");
      header.classList.add("desc");
    } else {
      header.classList.remove("desc");
      header.classList.add("asc");
    }
    // Replace the old rows with the sorted rows
    rows.forEach((row) => row.remove());
    sortedRows.forEach((row) => table.querySelector("tbody").appendChild(row));
  });
});

// Add click event listener to all "See More" buttons
const seeMoreButtons = document.querySelectorAll(".see-more");
seeMoreButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Find the parent "description" cell and add expandable class
    const descriptionCell = button.closest(".description-cell");
    descriptionCell.classList.add("expandable");
  });
});
