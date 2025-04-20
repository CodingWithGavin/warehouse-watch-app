// Global fetchInventory function
let allInventoryItems = [];

async function fetchInventory() {

  const inventoryTable = document.getElementById('inventory-body');
  const token = localStorage.getItem("accessToken");
  
  //this reachs our to our get api route to get the json data from the connected lambda so we can display it 
  try {
    const response = await fetch('https://layipqsy0l.execute-api.eu-west-1.amazonaws.com/dev/inventory', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        //need to provide authorisation as set un our CORs 
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const items = await response.json();
    allInventoryItems = items;
    //we then call out function to use the item info to populate the table
    populateTable(items);

  } catch (error) {
    console.error('Error fetching inventory:', error);
    inventoryTable.innerHTML = `<tr><td colspan="5" class="text-danger">Failed to load inventory</td></tr>`;
  }
}

//listeners for the refresh button
document.getElementById('refreshButton').addEventListener('click', fetchInventory);

// Function to populate table with inventory data
function populateTable(items) {
  //ensuring we are selecting the table in the inventory html
  const inventoryTable = document.getElementById('inventory-body');
  inventoryTable.innerHTML = ''; // Clear previous content so theres a clean slate to start with

  if (!Array.isArray(items)) {
    inventoryTable.innerHTML = `<tr><td colspan="5">No inventory data found.</td></tr>`;
    return;
  }

  //we go through each item passed in from the fetch fucntion
  items.forEach(item => {
    const row = document.createElement('tr');

    //we set warning for items which are getting close to being out of stock
    if(item.quantity <= 20){
      row.classList.add("table-danger");
    }

    else if(item.quantity <= 50)
    {
      row.classList.add("table-warning");
    }

    //here we poplate the row in order according to what we set so its in portant this lines up with the info from the inventory.html
    row.innerHTML = `
      <td>${item.itemId || '—'}</td>
      <td>${item.itemName || '—'}</td>
      <td>${item.description || '—'}</td>
      <td>${item.sku || '—'}</td>
      <td>${item.quantity || 0}</td>
      <td>${item.location || '—'}</td>
      <td>${item.manufacturer || '—'}</td>
      <td>${item.category || '—'}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-id="${item.itemId}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${item.itemId}">Delete</button>
      </td>
    `;

    // Attach event listeners to edit and delete buttons
    row.querySelector('.delete-btn').addEventListener('click', () => {
      deleteItem(item.itemId, item.itemName);
    });

    row.querySelector('.edit-btn').addEventListener('click', () => {
      openEditForm(item);
    });

    inventoryTable.appendChild(row);
  });
}

//Filter our table according to the search bar
function filterInventory() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  
  //this checks for any matching info in all the items of the row
  const filtered = allInventoryItems.filter(item => {
    const matchesSearch =
      item.itemId.toLowerCase().includes(search) ||
      item.itemName.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      item.sku.toLowerCase().includes(search) ||
      item.location.toLowerCase().includes(search) ||
      item.manufacturer.toLowerCase().includes(search);

    return matchesSearch ;
  });

  //this displays only the items from what we filtered
  populateTable(filtered);
}
//listenr for the search bar
document.getElementById('searchInput').addEventListener('input', filterInventory);

// Fetch inventory when page is loaded 
document.addEventListener('DOMContentLoaded', () => {
  fetchInventory();
});


// Add Item
async function addItemToInventory(event) {
  event.preventDefault(); // Prevent page reload on form submit

  const form = document.getElementById('addInventoryForm');

  if (!form.checkValidity()) {
    form.reportValidity(); // Show native browser validation
    return;
  }

  const itemName = document.getElementById('itemName').value;
  const description = document.getElementById('description').value;
  const sku = document.getElementById('sku').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  const location = document.getElementById('location').value;
  const manufacturer = document.getElementById('manufacturer').value;
  const category = document.getElementById('category').value;



  const item = {
    itemName,
    description,
    sku,
    quantity,
    location,
    manufacturer,
    category
  };

  const token = localStorage.getItem("accessToken");
  
  //good to have incase the users session timed out as this can hint to them needing to log back in
  if (!token) {
    alert("You need to be logged in to add an item. Try relogging in");
    return;
  }

  //This calls the api route to allow us to add to the inventory db 
  try {
    const response = await fetch('https://layipqsy0l.execute-api.eu-west-1.amazonaws.com/dev/inventory', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(item),
    });

    const data = await response.json();
    
    

    if (response.status === 200) {
      alert('Item added successfully!');
      fetchInventory(); // Refresh inventory list
      const collapseElement = document.getElementById('addInventoryCollapse');
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseElement); // collapses the modal form after a successful add 
      bsCollapse.hide();
    } else {
      alert('Error adding item');
      console.error(data);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while adding the item');
  }

  // Clear form after we are done 
    form.reset();
}

//this function is used to set up the edits of the row we have selects to edit for ourselves
function openEditForm(item) {
  document.getElementById('editItemId').value = item.itemId;
  document.getElementById('editItemName').value = item.itemName;
  document.getElementById('editDescription').value = item.description;
  document.getElementById('editSku').value = item.sku;
  document.getElementById('editQuantity').value = item.quantity;
  document.getElementById('editLocation').value = item.location;
  document.getElementById('editManufacturer').value = item.manufacturer;
  document.getElementById('editCategory').value = item.category;

  const editModal = new bootstrap.Modal(document.getElementById('editItemModal'));
  editModal.show();
}

document.getElementById('editItemForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("accessToken");
  const itemId = document.getElementById('editItemId').value;

  const updatedItem = {
    itemName: document.getElementById('editItemName').value,
    description: document.getElementById('editDescription').value,
    sku: document.getElementById('editSku').value,
    quantity: parseInt(document.getElementById('editQuantity').value, 10),
    location: document.getElementById('editLocation').value,
    manufacturer: document.getElementById('editManufacturer').value,
    category: document.getElementById('editCategory').value
  };

  //this calls our API route to update information on a specific item based on its itemid
  try {
    const response = await fetch(`https://layipqsy0l.execute-api.eu-west-1.amazonaws.com/dev/inventory/${itemId}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updatedItem)
    });

    if (!response.ok) throw new Error('Update failed');

    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();

    // Refresh inventory list
    fetchInventory();

  } catch (err) {
    console.error('Update error:', err);
    alert('Failed to update item.');
    // Refresh inventory list
    fetchInventory();
  }
});

// Delete Item
async function deleteItem(itemId, itemName) {
  const token = localStorage.getItem("accessToken");

  if (!confirm(`Are you sure you want to delete ${itemName}?`)) return;

  //calls the api route to delete from the database of a specific item based on its ID
  try {
    const response = await fetch(`https://layipqsy0l.execute-api.eu-west-1.amazonaws.com/dev/inventory/${itemId}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to delete item');

    alert('Item deleted successfully!');
    fetchInventory(); 
  } catch (error) {
    console.error("Delete failed:", error);
    alert("Error deleting item.");
  }
}
