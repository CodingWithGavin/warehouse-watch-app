// Global fetchInventory function
async function fetchInventory() {
  const inventoryTable = document.getElementById('inventory-body');
  const token = localStorage.getItem("accessToken");
  
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

    const items = await response.json(); // <-- use response directly
    populateTable(items);

  } catch (error) {
    console.error('Error fetching inventory:', error);
    inventoryTable.innerHTML = `<tr><td colspan="5" class="text-danger">Failed to load inventory</td></tr>`;
  }
}

// Function to populate table with inventory data
function populateTable(items) {
  const inventoryTable = document.getElementById('inventory-body');
  inventoryTable.innerHTML = ''; // Clear previous content

  if (!Array.isArray(items)) {
    inventoryTable.innerHTML = `<tr><td colspan="5">No inventory data found.</td></tr>`;
    return;
  }

  items.forEach(item => {
    const row = document.createElement('tr');
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

// Fetch inventory when page is loaded
document.addEventListener('DOMContentLoaded', () => {
  fetchInventory();
});

// Add Item
async function addItem() {
  // Get item data from the form
  const itemName = document.getElementById('itemName').value;
  const description = document.getElementById('description').value;
  const sku = document.getElementById('sku').value;
  const quantity = document.getElementById('quantity').value;
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
  
  if (!token) {
    alert("You need to be logged in to add an item.");
    return;
  }

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
    
    // Clear the form after adding the item
    document.getElementById('itemName').value = '';
    document.getElementById('description').value = '';
    document.getElementById('sku').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('location').value = '';
    document.getElementById('manufacturer').value = '';
    document.getElementById('category').value = '';

    if (response.status === 200) {
      alert('Item added successfully!');
      fetchInventory(); // Refresh inventory list
    } else {
      alert('Error adding item');
      console.error(data);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while adding the item');
  }
}

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
    quantity: document.getElementById('editQuantity').value,
    location: document.getElementById('editLocation').value,
    manufacturer: document.getElementById('editManufacturer').value,
    category: document.getElementById('editCategory').value
  };

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
  }
});

// Delete Item
async function deleteItem(itemId, itemName) {
  const token = localStorage.getItem("accessToken");

  if (!confirm(`Are you sure you want to delete ${itemName}?`)) return;

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
