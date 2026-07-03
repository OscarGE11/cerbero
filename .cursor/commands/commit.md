# Generar commit (commitlint)

Genera un mensaje de commit para los archivos **ya en staging** (`git add`).

## Reglas (obligatorio)

- Formato: `type(scope): subject` — conventional commits
- types: feat, fix, docs, chore, refactor, test, ci, build, perf
- subject: imperativo, sin punto final, máx. 72 caracteres
- cuerpo: cada línea máx. **100 caracteres** (varias líneas cortas, nunca un párrafo largo)
- sin `Co-authored-by` ni trailers extra
- inglés (estilo del repo)

## Qué hacer

1. Ejecuta `git diff --cached` para ver el staging
2. Escribe SOLO el mensaje de commit (subject + cuerpo opcional)
3. No ejecutes `git commit` salvo que el usuario lo pida explícitamente

## Ejemplo de salida

```
feat: add dashboard link after telegram linking

Add OTP page button and bot message with dashboard URL after /link.
```
