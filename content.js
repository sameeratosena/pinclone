let accumulatedData = JSON.parse(localStorage.getItem('accumulatedData')) || []; // Load data from localStorage or initialize as empty
let csvContent = localStorage.getItem('csvContent') || "data:text/csv;charset=utf-8,Image URL,Image Alt\n"; // Load CSV content from localStorage or initialize

// Function to add "Save Pin" label to a single image
function addPinLabelToImage(img) {
    if (img.naturalHeight < 600) return;

    if (img.dataset.pinLabelAdded) return; // Avoid adding multiple labels to the same image

    // Create a wrapper div to hold the image and the pin label
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    // Create the pin label
    const pinLabelDiv = document.createElement('div');
    pinLabelDiv.className = 'pin-label'; // Apply the CSS class
    pinLabelDiv.style.position = 'absolute';
    pinLabelDiv.style.top = '5px';
    pinLabelDiv.style.right = '5px';
    pinLabelDiv.style.zIndex = '9999';
    pinLabelDiv.style.cursor = 'pointer';
    pinLabelDiv.style.padding = '5px 10px';
    pinLabelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    pinLabelDiv.style.color = 'white';
    pinLabelDiv.style.fontSize = '14px';
    pinLabelDiv.style.borderRadius = '5px';
    pinLabelDiv.textContent = 'Save Pin';

    // Use event delegation for click handling
    pinLabelDiv.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent event from bubbling up



        if (event.currentTarget !== event.target) return;

    

        // const imageUrl = img.src || img.dataset.src;
        //const imageAlt = img.alt;

        const parentNode = img.parentNode; 
        const superparentNode = parentNode.parentNode; 

        const imgElements = superparentNode.querySelectorAll('img');
         // Extract src URL and alt text from each img element
         var imageAlt = "";
         imgElements.forEach(img => {
            // Handle lazy-loaded images
            const imageUrl = img.src || img.dataset.src;

            let oldString =  img.alt
            let newString = oldString.replace(/,/g, '');
            const imgtext =  newString ;
            if(imgtext != ""){
                imageAlt = imgtext;
                 // Remove all commas;
    
            }


            if (imageUrl && (imageUrl.endsWith('.png') || imageUrl.endsWith('.jpg'))) {
                console.log('Valid Image URL:', imageUrl);
                const isDuplicate = accumulatedData.some(item => item.imageUrl === imageUrl);
            if (!isDuplicate) {
            accumulatedData.push({ imageUrl, imageAlt });
            csvContent += `"${imageUrl}","${imageAlt}"\n`; // Append new data to CSV content
            localStorage.setItem('accumulatedData', JSON.stringify(accumulatedData)); // Save updated data to localStorage
            localStorage.setItem('csvContent', csvContent); // Save updated CSV content to localStorage
            console.log(`Image pinned: ${imageUrl}, alt: ${imageAlt}`);
            console.log(`csvContent: ${csvContent}`);
            }else{ 
                console.log(`Duplicate image URL skipped: ${imageUrl}`);
            }
        }
        });

    });

    // Wrap the image with the wrapper div and append the pin label
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    wrapper.appendChild(pinLabelDiv);

    // Mark this image as processed
    img.dataset.pinLabelAdded = 'true';
}

// Function to download the accumulated CSV data
function downloadCsv() {
    console.log("Initiating CSV download");
    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", "pinned_images.csv");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Function to observe changes in the DOM and add labels to new images
function observeImages() {
    document.querySelectorAll('img').forEach(addPinLabelToImage);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const newImages = node.querySelectorAll('img');
                        newImages.forEach(addPinLabelToImage);
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

// Run the functions on page load
window.addEventListener('load', () => {
    observeImages(); // Directly calling observeImages without throttling
    console.log("Observing images");
});

// Listen for messages from popup.js to trigger actions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'downloadCsv') {
        console.log("Received downloadCsv message");
        downloadCsv();
        sendResponse({ status: 'success' });
    } else if (request.action === 'startNewCsv') {
        console.log("Received startNewCsv message");
        accumulatedData = []; // Reset the accumulated data
        csvContent = "data:text/csv;charset=utf-8,Image URL,Image Alt\n"; // Reset the CSV content
        localStorage.removeItem('accumulatedData'); // Clear data from localStorage
        localStorage.removeItem('csvContent'); // Clear CSV content from localStorage
        sendResponse({ status: 'success' });
    }
});
