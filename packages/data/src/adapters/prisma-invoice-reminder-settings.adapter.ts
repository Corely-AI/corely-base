import { Injectable } from "@nestjs/common";
import { InvoiceReminderSettingsPort } from "@corely/kernel";
import { normalizeReminderPolicy, InvoiceReminderPolicy } from "@corely/domain";

@Injectable()
export class PrismaInvoiceReminderSettingsAdapter implements InvoiceReminderSettingsPort {
  async getPolicy(_tenantId: string, _workspaceId: string): Promise<InvoiceReminderPolicy> {
    return normalizeReminderPolicy();
  }
}
