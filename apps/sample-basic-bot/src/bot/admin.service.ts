import { Inject, Injectable } from '@nodecord/core';
import { LoggerService } from '../logger/logger.service.js';

@Injectable()
export class AdminService {
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    getStatus(): string {
        this.logger.log('AdminService.getStatus() called');
        return 'Bot is running';
    }
}
