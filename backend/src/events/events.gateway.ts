import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' }
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Inicializado.');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Cliente WS conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente WS desconectado: ${client.id}`);
  }

  @SubscribeMessage('join_expediente')
  handleJoinExpediente(@MessageBody() expedienteId: string, @ConnectedSocket() client: Socket) {
    this.logger.log(`Cliente ${client.id} se unió a la sala del Expediente: ${expedienteId}`);
    client.join(expedienteId);
    return { status: 'joined', room: expedienteId };
  }
}
