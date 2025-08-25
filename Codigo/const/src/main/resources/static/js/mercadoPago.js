 const mp = new MercadoPago('TEST-b31155f2-b0b4-46ac-a704-b533a5cff288', {
            locale: 'pt-BR'
        });

        async function finalizarPedido() {
            if (!pedidoId) {
               showAlert("Aviso", "Crie um pedido primeiro!", "warning");
                return;
            }

            
            const totalText = document.getElementById("totalCarrinho").textContent;
            const totalValue = parseFloat(totalText.replace("Total: R$ ", "").trim());

            if (totalValue <= 0) {
                showAlert("Aviso", "Adicione itens ao pedido antes de finalizar!", "warning");
                return;
            }

            try {
                
                const response = await fetch("http://localhost:8080/api/pedidos/criar-pagamento", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        pedidoId: pedidoId,
                        valor: totalValue,
                        descricao: "Pedido no Restaurante Apetito"
                    })
                });

                if (!response.ok) {
                    throw new Error("Erro ao criar pagamento");
                }

                const { id } = await response.json();

                const checkout = mp.checkout({
                    preference: {
                        id: id
                    },
                    autoOpen: true
                });

            } catch (error) {
                console.error("Erro ao finalizar pedido:", error);
                showAlert("Erro", "Erro ao processar pagamento. Tente novamente.", "error");

            }
        }