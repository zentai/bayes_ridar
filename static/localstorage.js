function initializeCounter() {
    if (!localStorage.getItem("serialCounter")) {
        localStorage.setItem("serialCounter", 1); // Start from 1
    }
}

// Function to add data with an auto-incremented key
function addDataToLocalStorage(data) {
    // Get the current counter
    let serialNumber = parseInt(localStorage.getItem("serialCounter"));

    // Store data with the serial number as the key
    localStorage.setItem(`data_${serialNumber}`, JSON.stringify(data));

    // Increment the counter and update it in localStorage
    localStorage.setItem("serialCounter", serialNumber + 1);
}

// Function to retrieve data by serial number
function getDataBySerialNumber(serialNumber) {
    const data = localStorage.getItem(`data_${serialNumber}`);
    return data ? JSON.parse(data) : null;
}

// Function to list all data stored with serial keys
function listAllData() {
    let dataList = [];
    const counter = parseInt(localStorage.getItem("serialCounter")) || 1;

    for (let i = 1; i < counter; i++) {
        var data = localStorage.getItem(`data_${i}`);
        if (data) {
            var mkr = JSON.parse(data)
            mkr.id = `data_${i}`;
            console.log(data)
            dataList.push(mkr);
        }
    }
    return dataList;
}

// Usage example
initializeCounter(); // Initialize the counter if not set
// addDataToLocalStorage({ name: "Item 1", description: "This is item 1" });
// addDataToLocalStorage({ name: "Item 2", description: "This is item 2" });

// Retrieve data by serial number
console.log(getDataBySerialNumber(1)); // Output: { name: "Item 1", description: "This is item 1" }
console.log(getDataBySerialNumber(2)); // Output: { name: "Item 2", description: "This is item 2" }

// List all stored data
console.log(listAllData());