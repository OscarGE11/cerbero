-- Remove unused comment column; expense date is stored in movements.date

ALTER TABLE movements DROP COLUMN IF EXISTS comment;
