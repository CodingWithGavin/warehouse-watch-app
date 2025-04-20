let allShipmentItems = []; 
let selectedItems = []; // Array to keep track of selected items for the shipment

// Fetch inventory items and populate the table
async function fetchInventory() {
  const inventoryTable = document.getElementById('inventory-body');
  const token = localStorage.getItem("accessToken");

  //we use the get route to get all the inventory item information to allow us to poplate our item selection
  try {
    const response = await fetch('https://layipqsy0l.execute-api.eu-west-1.amazonaws.com/dev/inventory', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const items = await response.json();
    allShipmentItems = items;
    populateTable(items);

  } catch (error) {
    console.error('Error fetching inventory:', error);
    inventoryTable.innerHTML = `<tr><td colspan="5" class="text-danger">Failed to load inventory</td></tr>`;
  }
}

// Populate inventory table with data
function populateTable(items) {
    const inventoryTable = document.getElementById('inventory-body');
    inventoryTable.innerHTML = ''; // Clear previous content
  
    if (!Array.isArray(items)) {
      inventoryTable.innerHTML = `<tr><td colspan="5">No inventory data found.</td></tr>`;
      return;
    }
  
    //we are only getting certain information not everything, populating the row if there is info or leaving placeholders if there isn't
    items.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.itemName || '—'}</td>
        <td>${item.quantity || 0}</td>
        <td>${item.manufacturer || '—'}</td>
        `;

        row.style.cursor = 'pointer';
        row.addEventListener('click', () => handleRowSelection(item));
        inventoryTable.appendChild(row);
    });
  }

  //this function gets the items we select and then the quantity of said item and then adds to our chosen item list
  function handleRowSelection(item) {
    const existingIndex = selectedItems.findIndex(i => i.itemId === item.itemId);
  
    if (existingIndex !== -1) {
      // Already selected — ask to update or remove
      const current = selectedItems[existingIndex];
      const newQuantity = prompt(`"${item.itemName}" is already selected with quantity ${current.quantity}.\nEnter a new quantity (or 0 to remove):`);
  
      if (newQuantity === null) return; // User cancelleds item by entering 0
  
      const parsedQuantity = parseInt(newQuantity, 10);
  
      if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        alert('Please enter a valid positive number or 0 to remove the item.'); //if we enter a negative it gives the appropriate response
      } else if (parsedQuantity === 0) {
        selectedItems.splice(existingIndex, 1); // Removes item
      } else {
        selectedItems[existingIndex].quantity = parsedQuantity; // Updates the quantity of the seelcted item
      }
  
    } else {
      // New item selection
      const quantity = prompt(`Enter quantity for "${item.itemName}":`);
      const parsedQuantity = parseInt(quantity, 10);
  
      if (quantity === null) return; // User cancelled
  
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        alert('Invalid quantity. Please enter a positive number.');
      } else {
        selectedItems.push({
          ...item,
          quantity: parsedQuantity
        });
      }
    }
  
    displaySelectedItems();
  }
  
  
  
  // Display selected items with quantity
  function displaySelectedItems() {
    const selectedItemsContainer = document.getElementById('selected-items-container');
    selectedItemsContainer.innerHTML = ''; // Clear the previous selection display
  
    if (selectedItems.length === 0) {
      selectedItemsContainer.innerHTML = '<p>No items selected.</p>';
    } else {
      selectedItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('selected-item');
        itemElement.innerHTML = `
          <p>Item: ${item.itemName} | Qty: ${item.quantity}</p>
        `;
        selectedItemsContainer.appendChild(itemElement);
      });
    }
  }

  //This function gathers all the information from our shipment form including other information like our workername based on the localstorage username and the time and 
  //then creates a shipment to add to the shipments database
  async function addToShipment() {
    const token = localStorage.getItem("accessToken");
    const workername = localStorage.getItem("username");
  
    // Get form values
    const recipientName = document.getElementById('recipientName').value.trim();
    const recipientCompany = document.getElementById('recipientCompany').value.trim();
    const orderAddress = document.getElementById('recipientAddress').value.trim();

  
    // Validate form
    if (!recipientName || !recipientCompany || !orderAddress) {
      alert('Please fill in all recipient details.');
      return;
    }
  
    if (!selectedItems.length) {
      alert('Please select items to add to the shipment.');
      return;
    }
  
    // Format selected items
    const shipmentItems = selectedItems.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity
    }));
  
    // Construct request payload
    const requestBody = {
      workername,
      recipientName: recipientName,
      recipientCompany: recipientCompany,
      orderAddress: orderAddress,
      items: shipmentItems
    };
  
    try {
      const response = await fetch('https://layipqsy0l.execute-api.eu-west-1.amazonaws.com/dev/shipments', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)  // Double-wrapped as required
      });
      
      const data = await response.json();
      console.log("Shipment response:", data);
  
      if (response.status === 200) {
        //if successful we geenrate a pdf of the shipment order
        generateShipmentPDF();
        alert('Shipment created successfully!');
        selectedItems = [];
        displaySelectedItems();
        document.getElementById('shipmentForm').reset();
      } else {
        alert('Failed to create shipment.');
        console.error(data);
      }
  
    } catch (error) {
      console.error('Error sending shipment:', error);
      alert('An error occurred while submitting the shipment.');
    }
  }
  
  
//uses the similar filter function from the inventory list to allow us to search for sepecific items
function filteritems() {
    const search = document.getElementById('searchInput').value.toLowerCase();
  
    const filtered = allShipmentItems.filter(item => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(search) ||
        item.manufacturer.toLowerCase().includes(search);
  
      return matchesSearch;
    });
  
    populateTable(filtered); // Re-populate the table with the filtered items
  }

// Add event listener for the search bar
document.getElementById('searchInput').addEventListener('input', filteritems);

// Add event listener for adding to shipment
document.getElementById('shipmentForm').addEventListener('submit', async (e) => {
    e.preventDefault()
  });
  

// Fetch inventory when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  fetchInventory();
});

//creates a pdf of the shipment order 
async function generateShipmentPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
  
    const date = new Date();
    const workername = localStorage.getItem("username");
    const recipientName = document.getElementById('recipientName').value.trim();
    const recipientCompany = document.getElementById('recipientCompany').value.trim();
    const orderAddress = document.getElementById('recipientAddress').value.trim();
  
    // Title of the pdf
    doc.setFontSize(18);
    doc.text("Shipment Summary", 20, 20);
  
    // Basic Info in the main part of the pdf
    doc.setFontSize(12);
    doc.text(`Date:  ${date.toLocaleDateString()}`, 20, 25)
    doc.text(`Worker: ${workername}`, 20, 35);
    doc.text(`Recipient: ${recipientName}`, 20, 45);
    doc.text(`Company: ${recipientCompany}`, 20, 55);
    doc.text(`Address: ${orderAddress}`, 20, 65);
  
    // Space before item table
    let y = 80;
    doc.setFontSize(14);
    doc.text("Items:", 20, y);
  
    y += 10;
    doc.setFontSize(12);
  
    if (selectedItems.length === 0) {
      doc.text("No items selected.", 20, y);
    } else {
      selectedItems.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.itemName} — Qty: ${item.quantity}`, 20, y);
        y += 10;
  
        // Add page break if going beyond limit
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    }
  
    // Save PDF
    doc.save("shipment-summary.pdf");

    //This next part goes through submitting the generated pdf file to our S3 bucket for added safekeeping
    // Generate the PDF as a Blob
  const pdfBlob = doc.output("blob");

    //  Get pre-signed URL from your backend, this is needed in order to submit the file to the s3 bucket

    //printable/readable timestamp for our pdfs name
    const now = new Date();
    const dateformat = now.toISOString().split('T')[0];
    const timeformat = now.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-'); 
    const formated = `${dateformat} | ${timeformat}`;

    const filename = `shipment-${formated}-${workername}.pdf`; //makes the pdf name the date it was made and the worker who made it 
    const token = localStorage.getItem("idToken"); // only needed if your API Gateway route is protected

    //Calls the route to get the lambda for the needed signed url
    const res = await fetch(`https://layipqsy0l.execute-api.eu-west-1.amazonaws.com/dev/shipments/getuploadurl?filename=${filename}`, {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${token}`
    }
    });
    const data = await res.json();
    const uploadUrl = data.uploadUrl;

    // Uploads the file to S3 using the signed PUT URL
    const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: pdfBlob,
    headers: {
        "Content-Type": "application/pdf" 
    }
    });

    if (uploadRes.ok) {
    alert("Shipment PDF uploaded successfully!");
    } else {
    alert("Upload failed. Please try again.");
    console.error("Upload error:", await uploadRes.text());
    }
}