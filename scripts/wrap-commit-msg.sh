#!/usr/bin/env bash
# Ajusta el mensaje de commit antes de commitlint:
# - elimina Co-authored-by de Cursor
# - parte líneas del cuerpo > 100 caracteres
set -euo pipefail

file="${1:?commit message file required}"
max=100
tmp="$(mktemp)"

while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" =~ ^Co-authored-by:\ Cursor ]]; then
    continue
  fi

  if [[ ${#line} -le $max ]]; then
    printf '%s\n' "$line" >> "$tmp"
    continue
  fi

  fold -s -w "$max" <<< "$line" >> "$tmp"
done < "$file"

mv "$tmp" "$file"
