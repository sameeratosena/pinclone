// Function to send a message to content script to start a new CSV file
document.getElementById('startNewCsv').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'startNewCsv' }, (response) => {
            if (response.status === 'success') {
                console.log('CSV file has been reset.');
            }
        });
    });
});

// Function to send a message to content script to download the CSV file
document.getElementById('downloadCsv').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'downloadCsv' }, (response) => {
            if (response.status === 'success') {
                console.log('CSV file has been downloaded.');
            }
        });
    });
});

const style = document.createElement('style');
style.textContent = `
    .pin-label {
        transition: background-color 0.3s, transform 0.2s;
    }
    .pin-label:active {
        background-color: rgba(255, 0, 0, 0.7); /* Change color when clicked */
        transform: scale(0.95); /* Slightly reduce size on click */
    }
`;
document.head.appendChild(style);
