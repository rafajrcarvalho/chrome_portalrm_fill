document.addEventListener('DOMContentLoaded', function () {
    // Carregar dados salvos
    chrome.storage.sync.get({
        justificativa: 'Desenvolvimento de sistemas',
        dadosPonto: '',
        userId: ''
    }, function (items) {
        document.getElementById('justificativa').value = items.justificativa;
        document.getElementById('dadosTabela').value = items.dadosPonto;
        document.getElementById('userId').value = items.userId;
    });

    // Botão de extrair ID
    document.getElementById('extrairId').addEventListener('click', function () {
        extrairUserId();
    });

    // Botão de visualização
    document.getElementById('visualizar').addEventListener('click', function () {
        visualizarDados();
    });

    // Botão de salvar e abrir sistema
    document.getElementById('salvar').addEventListener('click', function () {
        salvarDados();
        abrirSistema();
    });
});

// Função para extrair o userId (AnnexKeyValues) da URL
function extrairUserId() {
    const urlInput = document.getElementById('urlExtracao').value.trim();
    
    if (!urlInput) {
        alert('Por favor, insira uma URL válida.');
        return;
    }

    try {
        // Decodificar a URL primeiro
        const urlDecodificada = decodeURIComponent(urlInput);
        
        // Procurar pelo parâmetro AnnexKeyValues
        const regex = /AnnexKeyValues=([^&]+)/i;
        const match = urlDecodificada.match(regex);
        
        if (match) {
            const annexKeyValues = match[1];
            
            // Extrair apenas os dois primeiros valores (coligada;chapa)
            const partes = annexKeyValues.split(';');
            if (partes.length >= 2) {
                const userIdLimpo = partes[0] + ';' + partes[1];
                
                // Preencher o campo
                document.getElementById('userId').value = userIdLimpo;
                
                // Salvar automaticamente
                chrome.storage.sync.set({
                    userId: userIdLimpo
                }, function () {
                    alert(`ID do usuário extraído e salvo com sucesso: ${userIdLimpo}`);
                });
            } else {
                alert('Formato de AnnexKeyValues inválido. Esperado: coligada;chapa');
            }
        } else {
            alert('AnnexKeyValues não encontrado na URL. Verifique se a URL está correta.');
        }
    } catch (error) {
        alert('Erro ao processar a URL. Verifique se ela está correta.');
        console.error('Erro ao extrair userId:', error);
    }
}

// Função para visualizar os dados em formato de tabela
function visualizarDados() {
    const dadosTexto = document.getElementById('dadosTabela').value.trim();
    if (!dadosTexto) {
        alert('Por favor, insira alguns dados para visualizar.');
        return;
    }

    const linhas = dadosTexto.split('\n');
    const previewBody = document.getElementById('previewBody');
    previewBody.innerHTML = '';

    for (const linha of linhas) {
        if (!linha.trim()) continue;

        const colunas = linha.split('\t'); // Usar tab como separador específico
        
        // Aceitar 3, 4 ou 5 colunas
        if (colunas.length < 3 || colunas.length > 5) {
            alert('Formato inválido. Use:\n- 3 colunas: DATA INICIO FIM\n- 4 colunas: DATA INICIO FIM [vazias]\n- 5 colunas: DATA INI_1 FIM_1 INI_2 FIM_2');
            return;
        }

        const tr = document.createElement('tr');

        // Determinar se é formato simples ou completo
        const isFormatoSimples = colunas.length === 3 || 
                                (colunas.length >= 4 && (!colunas[3] || colunas[3].trim() === '') && 
                                 (colunas.length < 5 || !colunas[4] || colunas[4].trim() === ''));

        if (isFormatoSimples) {
            // Formato simples: data, entrada, saída
            const td1 = document.createElement('td');
            td1.textContent = colunas[0]; // Data
            tr.appendChild(td1);

            const td2 = document.createElement('td');
            td2.textContent = colunas[1] || ''; // Entrada
            tr.appendChild(td2);

            const td3 = document.createElement('td');
            td3.textContent = colunas[2] || ''; // Saída
            tr.appendChild(td3);

            const td4 = document.createElement('td');
            td4.textContent = ''; // Entrada 2 vazia
            tr.appendChild(td4);

            const td5 = document.createElement('td');
            td5.textContent = ''; // Saída 2 vazia
            tr.appendChild(td5);
        } else {
            // Formato completo: 5 colunas
            for (let i = 0; i < 5; i++) {
                const td = document.createElement('td');
                td.textContent = colunas[i] || '';
                tr.appendChild(td);
            }
        }

        previewBody.appendChild(tr);
    }

    document.getElementById('previewContainer').style.display = 'block';
}

// Função para salvar os dados
function salvarDados() {
    const justificativa = document.getElementById('justificativa').value;
    const dadosPonto = document.getElementById('dadosTabela').value;
    const userId = document.getElementById('userId').value;

    // Converter dados para formato estruturado
    const dadosEstruturados = processarDados(dadosPonto);

    chrome.storage.sync.set({
        justificativa: justificativa,
        dadosPonto: dadosPonto,
        dadosEstruturados: dadosEstruturados,
        userId: userId
    }, function () {
        console.log('Dados salvos com sucesso');
    });
}

// Função para processar os dados em um formato estruturado
function processarDados(dadosTexto) {
    const resultado = {};
    const linhas = dadosTexto.split('\n');

    for (const linha of linhas) {
        if (!linha.trim()) continue;

        const colunas = linha.split('\t'); // Usar tab como separador específico
        
        // Aceitar 3, 4 ou 5 colunas
        if (colunas.length < 3 || colunas.length > 5) {
            continue;
        }

        const data = colunas[0];
        
        // Determinar se é formato simples ou completo
        const isFormatoSimples = colunas.length === 3 || 
                                (colunas.length >= 4 && (!colunas[3] || colunas[3].trim() === '') && 
                                 (colunas.length < 5 || !colunas[4] || colunas[4].trim() === ''));
        
        if (isFormatoSimples) {
            // Formato simples: data, entrada, saída (sem intervalo de almoço)
            resultado[data] = {
                entrada1: (colunas[1] && colunas[1].trim() !== '00:00') ? colunas[1].trim() : '',
                saida1: (colunas[2] && colunas[2].trim() !== '00:00') ? colunas[2].trim() : '',
                entrada2: '',
                saida2: ''
            };
        } else {
            // Formato completo: data + 4 horários
            resultado[data] = {
                entrada1: (colunas[1] && colunas[1].trim() !== '00:00') ? colunas[1].trim() : '',
                saida1: (colunas[2] && colunas[2].trim() !== '00:00') ? colunas[2].trim() : '',
                entrada2: (colunas[3] && colunas[3].trim() !== '00:00') ? colunas[3].trim() : '',
                saida2: (colunas[4] && colunas[4].trim() !== '00:00') ? colunas[4].trim() : ''
            };
        }
    }

    return resultado;
}

// Função para abrir o sistema
function abrirSistema() {
    const userId = document.getElementById('userId').value.trim();
    
    if (!userId) {
        alert('Por favor, extraia o ID do usuário antes de abrir o sistema.');
        return;
    }
    
    const url = `https://portalrm.montreal.com.br/Corpore.Net/Main.aspx?ActionID=PtoatFunActionWeb&ShowMode=3&AnnexKeyValues=${encodeURIComponent(userId)}`;
    chrome.tabs.create({ url: url });
}
