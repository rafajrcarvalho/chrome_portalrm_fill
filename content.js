function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatarData(dataTexto) {
    const dataSemHora = dataTexto.split(' ')[0];
    return dataSemHora;
}

async function preencherFormulario() {
    console.log('Iniciando preenchimento automático...');

    // Obter dados salvos
    chrome.storage.sync.get({
        justificativa: '',
        dadosEstruturados: {}
    }, async function (items) {
        const justificativaGlobal = items.justificativa;
        const dadosPonto = items.dadosEstruturados;
        
        // Preencher o campo de justificativa principal
        const justificativaPrincipal = document.getElementById('GB_txtJustificativa');
        if (justificativaPrincipal && justificativaGlobal) {
            justificativaPrincipal.value = justificativaGlobal;
            justificativaPrincipal.dispatchEvent(new Event('input', { bubbles: true }));
            justificativaPrincipal.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Obter a div principal que contém todas as tabelas
        const divGrid = document.getElementById('GB_pnGridBatidas');
        if (!divGrid) {
            return;
        }

        // Obter todas as tabelas dentro da div
        const tables = divGrid.getElementsByTagName('table');
        const totalTables = tables.length;

        // Iterar por cada tabela em ordem inversa (da última para a primeira)
        for (let i = totalTables - 1; i >= 0; i--) {
            const table = tables[i];

            // Obter os elementos relevantes
            const dataSpan = table.querySelector(`#GB_l${i}_lblData`);
            const diaSpan = table.querySelector(`#GB_l${i}_lblDia`);
            const entrada1 = table.querySelector(`#GB_l${i}_txtEnt1`);
            const saida1 = table.querySelector(`#GB_l${i}_txtSai1`);
            const entrada2 = table.querySelector(`#GB_l${i}_txtEnt2`);
            const saida2 = table.querySelector(`#GB_l${i}_txtSai2`);
            const justificativa = table.querySelector(`#GB_l${i}_txtJust`);

            // Obter a data para o log
            const dataTexto = dataSpan ? dataSpan.textContent.trim() : 'Data não encontrada';
            const diaTexto = diaSpan ? diaSpan.textContent.trim() : 'Dia não encontrado';

            // Verificar se temos dados específicos para esta data
            const dataFormatada = formatarData(dataTexto);
            const dadosData = dadosPonto[dataFormatada];

            if (dadosData) {
                // Preencher entrada1 se tivermos um valor
                if (entrada1 && dadosData.entrada1) {
                    entrada1.value = dadosData.entrada1;
                    entrada1.dispatchEvent(new Event('input', { bubbles: true }));
                    entrada1.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // Preencher saida1 se tivermos um valor
                if (saida1 && dadosData.saida1) {
                    saida1.value = dadosData.saida1;
                    saida1.dispatchEvent(new Event('input', { bubbles: true }));
                    saida1.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // Preencher entrada2 se tivermos um valor
                if (entrada2 && dadosData.entrada2) {
                    entrada2.value = dadosData.entrada2;
                    entrada2.dispatchEvent(new Event('input', { bubbles: true }));
                    entrada2.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // Preencher saida2 se tivermos um valor
                if (saida2 && dadosData.saida2) {
                    saida2.value = dadosData.saida2;
                    saida2.dispatchEvent(new Event('input', { bubbles: true }));
                    saida2.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // Preencher justificativa apenas para as datas especificadas
                if (justificativa && justificativaGlobal) {
                    justificativa.value = justificativaGlobal;
                    justificativa.dispatchEvent(new Event('input', { bubbles: true }));
                    justificativa.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }

            await esperar(300);
        }

        console.log('Preenchimento concluído!');
    });
}

// Função para verificar se os elementos estão presentes e preenchê-los
function verificarEPreencher() {
    const divGrid = document.getElementById('GB_pnGridBatidas');
    if (divGrid) {
        preencherFormulario();
    } else {
        // Se a div principal não estiver presente, tentar novamente em 500ms
        setTimeout(verificarEPreencher, 500);
    }
}

// Executar a função quando a página carregar
window.addEventListener('load', verificarEPreencher);

// Também verificar quando o DOM for modificado (para páginas dinâmicas)
const observador = new MutationObserver(function (mutacoes) {
    const divGrid = document.getElementById('GB_pnGridBatidas');
    if (divGrid && !document.preenchimentoIniciado) {
        document.preenchimentoIniciado = true;
        preencherFormulario();
    }
});

// Iniciar a observação do DOM
document.addEventListener('DOMContentLoaded', function () {
    observador.observe(document.body, {
        childList: true,
        subtree: true
    });
});
