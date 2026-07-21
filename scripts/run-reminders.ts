import "dotenv/config";
import { processDueReminders } from "../src/lib/process-due-reminders";

async function main() {
  const result = await processDueReminders();
  console.log(
    JSON.stringify(
      { processed: result.processed, reminders: result.reminders },
      null,
      2,
    ),
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
