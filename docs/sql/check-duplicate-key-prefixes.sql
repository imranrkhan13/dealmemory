-- Read only. Must return zero rows before the unique-prefix migration.
SELECT "keyPrefix", count(*) FROM "ProjectApiKey" GROUP BY "keyPrefix" HAVING count(*) > 1;
