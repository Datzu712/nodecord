import { Injectable } from '@nodecord/core';

@Injectable()
export class LoggerService {
    log(message: string): void {
        console.log(`[LOG] ${message}`);
    }
}
