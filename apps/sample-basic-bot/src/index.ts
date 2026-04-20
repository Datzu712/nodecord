import { NodecordClient } from '@nodecord/core';
import { MainModule } from './app.module';
import { AdminService } from './bot/modules/admin/admin.service';

const client = new NodecordClient(MainModule);

const admin = client.get(AdminService);
console.log(admin.getStatus());
