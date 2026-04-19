import { NodecordClient } from '@nodecord/core';
import { MainModule } from './app.module.js';
import { AdminService } from './bot/admin.service.js';

const client = new NodecordClient(MainModule);

// services resolved normally via DI
const admin = client.resolve(AdminService);
console.log(admin.getStatus());
