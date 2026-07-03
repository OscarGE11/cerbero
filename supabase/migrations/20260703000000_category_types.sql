-- Split categories by movement type (expense vs income)

ALTER TABLE categories
  ADD COLUMN type TEXT NOT NULL DEFAULT 'expense'
  CHECK (type IN ('expense', 'income'));

ALTER TABLE categories DROP CONSTRAINT categories_name_key;

ALTER TABLE categories
  ADD CONSTRAINT categories_name_type_unique UNIQUE (name, type);

INSERT INTO categories (name, type) VALUES
  ('Salario', 'income'),
  ('Freelance', 'income'),
  ('Inversiones', 'income'),
  ('Venta', 'income'),
  ('Reembolso', 'income'),
  ('Otro', 'income')
ON CONFLICT (name, type) DO NOTHING;
