import app from "./app";
import { logger } from "./config/logger";
import { enableServicoAuditMiddleware } from "./middlewares/prismaAudit";

const port = Number(process.env.PORT) || 3001;

enableServicoAuditMiddleware();

app.listen(port, () => {
  logger.info(`server listening on ${port}`);
});
