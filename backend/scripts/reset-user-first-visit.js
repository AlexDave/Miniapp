/**
 * Сброс пользователя «как первый вход»: прогресс, онбординг, питомец, напоминания, платежи, чат и т.д.
 * Сохраняются: запись User (telegram_id, id, имя), запись Profile (обнуляется содержимое).
 *
 * RESET_USER_ID — числовой id пользователя; если не задан — первый пользователь по id.
 *
 *   cd backend && node scripts/reset-user-first-visit.js
 *   RESET_USER_ID=2 node scripts/reset-user-first-visit.js
 */
require('dotenv').config();

const { prisma } = require('../src/database/connection');
const { resetUserFirstVisit } = require('../src/services/resetUserFirstVisit');

async function main() {
  const raw = process.env.RESET_USER_ID;
  let userId;
  if (raw != null && String(raw).trim() !== '') {
    userId = parseInt(String(raw).trim(), 10);
    if (!Number.isFinite(userId)) throw new Error(`Некорректный RESET_USER_ID: ${raw}`);
  } else {
    const u = await prisma.user.findFirst({ orderBy: { id: 'asc' } });
    if (!u) throw new Error('В БД нет пользователей');
    userId = u.id;
  }

  const meta = await resetUserFirstVisit(userId);

  console.log(
    JSON.stringify(
      {
        ok: true,
        user_id: userId,
        new_pet_created_for_family_fork: meta.newPetCreatedForFamilyFork,
        message: 'Пользователь сброшен: онбординг, прогресс, напоминания, подписка, история уроков.',
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
