INSERT INTO others_information (type, detail, created_at, updated_at)
SELECT 'maximum_expired', '90', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM others_information WHERE type = 'maximum_expired');
