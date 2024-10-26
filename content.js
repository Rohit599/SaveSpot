window.onload = () => {
    const pageURL = window.location.href;

    chrome.storage.sync.get([pageURL], function(data) {
        let highlights = data[pageURL];
        if (highlights) {
            highlights.forEach(item => {
                const highlightElement = document.createElement('mark');
                highlightElement.style.backgroundColor = 'yellow';
                highlightElement.textContent = item.text;

                const bodyHTML = document.body.innerHTML;
                document.body.innerHTML = bodyHTML.replace(item.text, highlightElement.outerHTML);
            });
        }
    });
};
