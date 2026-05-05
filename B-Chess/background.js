chrome.action.onClicked.addListener((tab) => {
    // Eklenti ikonuna tıklandığında sayfaya "Paneli Aç/Kapa" sinyali gönder
    chrome.tabs.sendMessage(tab.id, { command: "togglePanel" });
});