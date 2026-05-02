import { Module } from '@nodecord/core';
import { LoggerModule } from '../logger/logger.module.js';
import { AdminService } from './admin.service.js';
import { AdminHandler } from './admin.handler.js';

@Module({
    imports: [LoggerModule], // <-- This will trigger the circular import exception for demonstration
    providers: [AdminService],
    handlers: [AdminHandler],
})
export class AdminModule {}
