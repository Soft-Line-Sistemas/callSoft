/**
 * NotificationService - Motor de Notificações
 * Responsável por enviar notificações passivas ao cliente baseado no canal de origem do ticket.
 */

// Tipo do ticket com informações necessárias para notificação
interface TicketForNotification {
    pedido: number;
    contato: string | null;
    canalOrigem: string;
    status: string;
}

export class NotificationService {
    /**
     * Envia notificação ao cliente quando o status do ticket muda.
     * Verifica o canal de origem e direciona para o método apropriado.
     */
    async notifyStatusChange(
        ticket: TicketForNotification,
        statusAnterior: string | null,
        statusNovo: string
    ): Promise<void> {
        console.log(
            `[NotificationService] Status changed: ${ticket.pedido} | ${statusAnterior} -> ${statusNovo}`
        );

        switch (ticket.canalOrigem) {
            case "WHATSAPP":
                await this.sendWhatsAppNotification(ticket, statusNovo);
                break;
            case "EMAIL":
                await this.sendEmailNotification(ticket, statusNovo);
                break;
            case "WEB":
                // Para canal WEB, não há notificação passiva por enquanto
                console.log(
                    `[NotificationService] Canal WEB - notificação apenas via dashboard`
                );
                break;
            default:
                console.log(
                    `[NotificationService] Canal desconhecido: ${ticket.canalOrigem}`
                );
        }
    }

    /**
     * MOCK: Envia mensagem via WhatsApp API
     * TODO: Integrar com Evolution API ou provedor oficial
     */
    private async sendWhatsAppNotification(
        ticket: TicketForNotification,
        statusNovo: string
    ): Promise<void> {
        const phoneNumber = ticket.contato;
        if (!phoneNumber) {
            console.warn(
                `[NotificationService] WhatsApp: Número de contato não encontrado para pedido ${ticket.pedido}`
            );
            return;
        }

        const message = this.buildStatusMessage(ticket.pedido, statusNovo);

        // MOCK: Simula chamada à API do WhatsApp
        console.log(`[NotificationService] 📱 WhatsApp MOCK`);
        console.log(`  Para: ${phoneNumber}`);
        console.log(`  Mensagem: ${message}`);

        // TODO: Implementar chamada real
        // await fetch('https://api.whatsapp.provider.com/send', {
        //   method: 'POST',
        //   body: JSON.stringify({ to: phoneNumber, message })
        // });
    }

    /**
     * MOCK: Envia e-mail transacional
     * TODO: Integrar com serviço de e-mail (SendGrid, SES, etc.)
     */
    private async sendEmailNotification(
        ticket: TicketForNotification,
        statusNovo: string
    ): Promise<void> {
        const email = ticket.contato; // Assumindo que contato pode ser e-mail
        if (!email) {
            console.warn(
                `[NotificationService] Email: Endereço não encontrado para pedido ${ticket.pedido}`
            );
            return;
        }

        const subject = `CALLSOFT - Atualização do Chamado #${ticket.pedido}`;
        const body = this.buildStatusMessage(ticket.pedido, statusNovo);

        // MOCK: Simula envio de e-mail
        console.log(`[NotificationService] 📧 Email MOCK`);
        console.log(`  Para: ${email}`);
        console.log(`  Assunto: ${subject}`);
        console.log(`  Corpo: ${body}`);

        // TODO: Implementar chamada real
        // await emailProvider.send({ to: email, subject, body });
    }

    /**
     * Monta a mensagem de notificação de status
     */
    private buildStatusMessage(pedido: number, statusNovo: string): string {
        const statusMessages: Record<string, string> = {
            Solicitado: "foi registrado e está aguardando atendimento",
            "Em Atendimento": "está sendo atendido por nossa equipe",
            "Pendente Atendimento": "está pendente de atendimento",
            Concluido: "foi concluído com sucesso",
            Cancelado: "foi cancelado",
        };

        const statusText =
            statusMessages[statusNovo] || `teve seu status alterado para: ${statusNovo}`;

        return `Olá! Seu chamado #${pedido} ${statusText}. Acompanhe pelo nosso sistema.`;
    }
}
