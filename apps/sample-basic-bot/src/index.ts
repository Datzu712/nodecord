import { NodecordClient } from '@nodecord/core';
import { MainModule } from './app.module.js';
import { AdminService } from './bot/admin.service.js';

const client = new NodecordClient(MainModule);

const admin = client.get(AdminService);
console.log(admin.getStatus());
