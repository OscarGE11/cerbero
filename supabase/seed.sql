INSERT INTO categories (name, type) VALUES
  ('Alimentación', 'expense'),
  ('Transporte', 'expense'),
  ('Ocio', 'expense'),
  ('Salud', 'expense'),
  ('Hogar', 'expense'),
  ('Ropa', 'expense'),
  ('Suscripciones', 'expense'),
  ('Otro', 'expense'),
  ('Salario', 'income'),
  ('Freelance', 'income'),
  ('Inversiones', 'income'),
  ('Venta', 'income'),
  ('Reembolso', 'income'),
  ('Otro', 'income')
ON CONFLICT (name, type) DO NOTHING;
