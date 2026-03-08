import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { nanoid } from "nanoid";
import { AppModule } from "../../../services/api/src/app.module";
import type { PostgresTestDb } from "./postgres-test-db";
import { SignUpUseCase } from "../../../services/api/src/modules/identity/application/use-cases/sign-up.usecase";
import { CreateWorkspaceUseCase } from "../../../services/api/src/modules/workspaces/application/use-cases/create-workspace.usecase";
import { buildRequestContext } from "../../../services/api/src/shared/context/request-context";

export async function createApiTestApp(db: PostgresTestDb): Promise<INestApplication> {
  process.env.DATABASE_URL = db.url;
  process.env.NODE_ENV = "test";
  process.env.WORKFLOW_QUEUE_DRIVER = "memory";
  process.env.EMAIL_PROVIDER = "resend";
  process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "test-resend-key";

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

export async function seedDefaultTenant(app: INestApplication) {
  const signUp = app.get(SignUpUseCase);
  const createWorkspace = app.get(CreateWorkspaceUseCase);
  const suffix = nanoid();

  const signUpResult = await signUp.execute({
    email: `owner-${suffix}@example.com`,
    password: "Password123!",
    tenantName: `Test Tenant ${suffix}`,
    userName: "Owner",
    idempotencyKey: `seed-signup-${suffix}`,
    context: buildRequestContext(),
  });

  const workspaceResult = await createWorkspace.execute({
    tenantId: signUpResult.tenantId,
    userId: signUpResult.userId,
    name: "Default Workspace",
    kind: "PERSONAL",
    legalName: "Default Workspace",
    countryCode: "US",
    currency: "USD",
    idempotencyKey: `seed-workspace-${suffix}`,
  });

  return {
    ...signUpResult,
    workspaceId: workspaceResult.workspace.id,
  };
}
