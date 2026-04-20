import { Injectable } from '@nodecord/core';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AdminService {
    constructor(private readonly logger: LoggerService) {}

    getStatus(): string {
        this.logger.log('AdminService.getStatus() called');
        return '6 or 7';
    }
}
