var toggle = false;

function toggleDate() {
  toggle = !toggle;
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("myTable");
  switching = true;
  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("td")[5];
      y = rows[i + 1].getElementsByTagName("td")[5];
      if (toggle) {
        if (x.innerHTML < y.innerHTML) {
          shouldSwitch = true;
          break;
        }
      } else {
        if (x.innerHTML > y.innerHTML) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}
var toggle = false;
function toggleRemoveDate() {
  toggle = !toggle;
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("myTable");
  switching = true;
  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("td")[6];
      y = rows[i + 1].getElementsByTagName("td")[6];
      if (toggle) {
        if (x.innerHTML < y.innerHTML) {
          shouldSwitch = true;
          break;
        }
      } else {
        if (x.innerHTML > y.innerHTML) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}
