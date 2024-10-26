chrome.runtime.onInstalled.addListener(() => {
    // Create the "Highlight" context menu
    chrome.contextMenus.create({
        id: "highlight",
        title: "Highlight Selected Text",
        contexts: ["selection"]
    });

    // Create the "Unhighlight" context menu
    chrome.contextMenus.create({
        id: "unhighlight",
        title: "Remove Highlight",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "highlight") {
        // Highlight the selected text
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: highlightSelection
        });
    } else if (info.menuItemId === "unhighlight") {
        // Remove the specific highlighted selection
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: removeSelectedHighlight
        });
    }
});

function highlightSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
        return;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = 'yellow';
    span.className = 'custom-highlight'; // Add a class to identify the highlight
    range.surroundContents(span);

    const highlightedText = selection.toString();
    const pageURL = window.location.href;

    // Save highlighted text
    chrome.storage.sync.get([pageURL], function (data) {
        let highlights = data[pageURL] || [];
        highlights.push({ text: highlightedText });
        chrome.storage.sync.set({ [pageURL]: highlights });
    });
}

// Function to remove the specific selected highlight
function removeSelectedHighlight() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
        return;
    }

    const selectedText = selection.toString();
    if (!selectedText) {
        return;
    }

    // Remove the specific highlight from storage
    const pageURL = window.location.href;
    chrome.storage.sync.get([pageURL], function (data) {
        let highlights = data[pageURL] || [];
        // Filter out the specific highlighted text that matches the selected text
        highlights = highlights.filter(item => item.text !== selectedText);
        chrome.storage.sync.set({ [pageURL]: highlights });
    });

    const range = selection.getRangeAt(0);
    let container = range.commonAncestorContainer;

    // Ensure `container` is an element
    if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentNode;
    }

    // Traverse the parent node to find the exact highlighted element that matches the selected text
    if (container && container.classList && container.classList.contains('custom-highlight') && container.textContent.trim() === selectedText) {
        // Remove the highlight if it matches
        const parent = container.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(container.textContent), container);
            parent.normalize(); // Merge adjacent text nodes
        }
    } else {
        // If the selected text is within a deeper structure, traverse the children
        const childNodes = container.childNodes;
        childNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE &&
                node.classList.contains('custom-highlight') &&
                node.textContent.trim() === selectedText) {
                const parent = node.parentNode;
                if (parent) {
                    parent.replaceChild(document.createTextNode(node.textContent), node);
                    parent.normalize(); // Merge adjacent text nodes
                }
            }
        });
    }
}
