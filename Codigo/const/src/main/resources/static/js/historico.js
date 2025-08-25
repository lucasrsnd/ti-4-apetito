document.addEventListener('DOMContentLoaded', carregarHistorico);

        function carregarHistorico() {
            const sessionId = localStorage.getItem('current_session_id');
            if (!sessionId) {
                document.getElementById('historicoPedidos').innerHTML = '<p>Nenhum histórico de pedidos encontrado.</p>';
                return;
            }

            const historico = JSON.parse(localStorage.getItem('cliente_session_pedidos') || '{}');
            const pedidos = historico[sessionId] || [];

            if (pedidos.length === 0) {
                document.getElementById('historicoPedidos').innerHTML = '<p>Nenhum pedido encontrado nesta sessão.</p>';
                return;
            }

            let html = '';
            pedidos.forEach(pedido => {
                html += `
                    <div class="pedido-card">
                        <div class="pedido-header">
                            <span><strong>Pedido #${pedido.id}</strong></span>
                            <span>${new Date(pedido.data).toLocaleString()}</span>
                            <span>Tipo: ${pedido.tipo === 'mesa' ? 'Mesa' : 'Online'}</span>
                            <span>Status: ${pedido.status}</span>
                        </div>
                        
                        ${pedido.itens.map(item => `
                            <div class="pedido-item">
                                <span>${item.itemCardapio.nome} x ${item.quantidade}</span>
                                <span>R$ ${(item.itemCardapio.preco * item.quantidade).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        
                        <div class="pedido-total">
                        Total: R$ ${(pedido.total || pedido.itens.reduce((sum, item) => sum + (item.itemCardapio.preco * item.quantidade), 0)).toFixed(2)}
                        </div>
                        
                        ${pedido.avaliacao ? `
                            <div class="avaliacao">
                                <h3>Avaliação</h3>
                                <p>Ambiente: ${'★'.repeat(pedido.avaliacao.ambiente)}${'☆'.repeat(5 - pedido.avaliacao.ambiente)}</p>
                                <p>Comida: ${'★'.repeat(pedido.avaliacao.comida)}${'☆'.repeat(5 - pedido.avaliacao.comida)}</p>
                                <p>Atendimento: ${'★'.repeat(pedido.avaliacao.atendimento)}${'☆'.repeat(5 - pedido.avaliacao.atendimento)}</p>
                                ${pedido.avaliacao.comentario ? `<p>Comentário: "${pedido.avaliacao.comentario}"</p>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            document.getElementById('historicoPedidos').innerHTML = html;
        }

        function limparSessao() {
            const sessionId = localStorage.getItem('current_session_id');
            if (sessionId) {
                const historico = JSON.parse(localStorage.getItem('cliente_session_pedidos') || '{}');
                delete historico[sessionId];
                localStorage.setItem('cliente_session_pedidos', JSON.stringify(historico));
            }
            localStorage.removeItem('current_session_id');
            window.location.href = 'cliente.html';
        }