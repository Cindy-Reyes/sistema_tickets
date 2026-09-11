import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";

async function main() {
  const email = "cindy.reyess007@gmail.com";
  const name = "Cindy Reyes";
  const passwordHash = await hashPassword("1234");

  await db
    .insert(users)
    .values({ email, name, role: "ADMIN", passwordHash })
    .onConflictDoNothing();

  console.log("Usuario administrador creado exitosamente.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error en el seed:", err);
  process.exit(1);
});
