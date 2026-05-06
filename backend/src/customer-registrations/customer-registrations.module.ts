import { Module } from '@nestjs/common';
import { CustomerRegistrationsController } from './customer-registrations.controller';
import { CustomerRegistrationsService } from './customer-registrations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [PrismaModule, CustomersModule],
  controllers: [CustomerRegistrationsController],
  providers: [CustomerRegistrationsService],
  exports: [CustomerRegistrationsService],
})
export class CustomerRegistrationsModule {}
