// Listener para quando o usuário clicar no ícone da extensão
chrome.action.onClicked.addListener(function(tab) {
    // Buscar dados salvos no storage
    chrome.storage.sync.get({
        userId: ''
    }, function(items) {
        if (!items.userId) {
            // Se não há userId salvo, abrir o popup
            chrome.action.openPopup();
            return;
        }
        
        // Construir a URL com userId salvo e URL estática
        const url = `https://portalrm.montreal.com.br/Corpore.Net/Main.aspx?ActionID=PtoatFunActionWeb&ShowMode=3&AnnexKeyValues=${encodeURIComponent(items.userId)}`;
        
        // Abre a URL em uma nova aba
        chrome.tabs.create({ url: url });
    });
});
  