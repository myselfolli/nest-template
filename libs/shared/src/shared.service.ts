import { IMeta, IResponse } from '@dtos/base/response';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RmqContext, RmqOptions, Transport } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RmqService } from './microServices';

/**
 * The unwrapped type of the 'result' parameter of a ResponseDTO, which can never be undefined
 */
type ResponseDTOResultType<T extends (context: RmqContext, ...args: unknown[]) => Promise<IResponse<unknown>>> =
  Awaited<ReturnType<T>>['result'];

@Injectable()
export class SharedService {
  constructor(private configService: ConfigService<Record<string, unknown>, true>) {}

  /**
   * Retrieves the RabbitMQ (RMQ) options for a given queue name.
   *
   * @param queueName - The name of the RMQ queue.
   * @returns The RMQ options object.
   */
  public getRmqOptions(queueName: `${RmqService}_QUEUE`): RmqOptions {
    const RMQ_USER = this.configService.get<string>('RMQ_USER');
    const RMQ_PASSWORD = this.configService.get<string>('RMQ_PASS');
    const RMQ_HOST = this.configService.get<string>('RMQ_HOST');

    return {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${RMQ_USER}:${RMQ_PASSWORD}@${RMQ_HOST}`],
        queue: queueName,
        queueOptions: {
          durable: false,
        },
      },
    };
  }

  /**
   * A call to another microservice. This function handles errors
   *
   * @param proxy The ClientProxy to call (represents a microservice)
   * @param message The message to send into the RMQ queue
   * @param payload The payload to send into the RMQ queue
   * @returns The response from the microservice
   *
   * @throws An appropriate HttpException if the call fails
   */
  public async microserviceCall<
    MethodToCall extends (...args: unknown[]) => Promise<IResponse<ResponseDTOResultType<MethodToCall>>>,
  >(
    proxy: ClientProxy,
    methodToCall: MethodToCall,
    payload: Parameters<MethodToCall>[0],
  ): Promise<Awaited<ReturnType<MethodToCall>>> {
    const result = await lastValueFrom(
      proxy.send<Awaited<ReturnType<MethodToCall>>, Parameters<MethodToCall>[1]>(
        Buffer.from(methodToCall.name).toString('base64'),
        payload ? payload : {},
      ),
    );

    if (!result) {
      throw new HttpException('Internal microservice call failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result;
  }

  /**
   * A call from within the cluster to another microservice. This function strips the metadata from the response and handles errors
   *
   * @param proxy The ClientProxy to call (represents a microservice)
   * @param message The message to send into the RMQ queue
   * @param payload The payload to send into the RMQ queue
   * @returns The response from the microservice, without metadata
   *
   * @throws An appropriate HttpException if the call fails
   */
  public async internalMicroserviceCall<
    MethodToCall extends (...args: unknown[]) => Promise<IResponse<ResponseDTOResultType<MethodToCall>>>,
  >(
    proxy: ClientProxy,
    methodToCall: MethodToCall,
    payload: Parameters<MethodToCall>[0],
  ): Promise<ResponseDTOResultType<MethodToCall>> {
    const result = await this.microserviceCall<MethodToCall>(proxy, methodToCall, payload ? payload : {});

    if (!result.meta.success) {
      throw new HttpException(result.meta.message || 'Unkown error', result.meta.statusCode);
    }

    if (result.result === undefined || result.result == null) {
      throw new HttpException('Internal microservice call failed (no result)', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result.result;
  }

  /**
   * Acknowledge a message from the RMQ queue
   *
   * @param context The RMQ context
   * @deprecated
   */
  public ackMessage(context: RmqContext): void {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    channel.ack(message);
  }

  /**
   * Get meta information to return to the client
   *
   * @param statusCode The HTTP status code
   * @param resCount The number of results
   * @param message A custom message
   * @param additionalInformation Any additional information to return
   * @returns The meta information
   */
  public getMeta(
    statusCode: HttpStatus,
    resCount?: number,
    additionalDetails?: {
      message?: string;
      additionalInformation?: unknown;
    },
  ): IMeta {
    const { message, additionalInformation } = additionalDetails || {};
    return {
      statusCode,
      success: statusCode < 300,
      message,
      resCount: resCount || 0,
      additionalInformation,
    };
  }
}
