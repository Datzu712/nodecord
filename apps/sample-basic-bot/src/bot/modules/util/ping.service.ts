import { Inject, Injectable } from '@nodecord/core';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class PingService {
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    ping(): string {
        this.logger.log('PingService.ping() called');
        return 'pong';
    }
}
