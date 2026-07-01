INSERT INTO categories (name) VALUES
  ('Alimentación'),
  ('Transporte'),
  ('Ocio'),
  ('Salud'),
  ('Hogar'),
  ('Ropa'),
  ('Suscripciones'),
  ('Otro')
ON CONFLICT (name) DO NOTHING;
