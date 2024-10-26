document.addEventListener('DOMContentLoaded', function () {
    const highlightsContainer = document.getElementById("highlights");
    chrome.storage.sync.get(null, function (items) {
        for (let [key, value] of Object.entries(items)) {
            const div = document.createElement("div");
            div.innerHTML = `<strong>${key}</strong>: ${value.map(v => v.text).join(", ")}`;
            highlightsContainer.appendChild(div);
        }
    });
});
