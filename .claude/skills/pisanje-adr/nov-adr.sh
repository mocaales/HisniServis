#!/usr/bin/env bash
# Ustvari nov ADR iz predloge z naslednjo prosto številko.
# Uporaba: .claude/skills/pisanje-adr/nov-adr.sh "kratek opis odlocitve"
set -euo pipefail

if [ $# -lt 1 ] || [ -z "$1" ]; then
  echo "Uporaba: $0 \"kratek opis odlocitve\"" >&2
  exit 1
fi

koren="$(git rev-parse --show-toplevel)"
mapa="$koren/docs/adr"
predloga="$mapa/adr-template.md"

zadnja=$(find "$mapa" -maxdepth 1 -name '[0-9][0-9][0-9][0-9]-*.md' -exec basename {} \; \
  | cut -c1-4 | sort -n | tail -1)
naslednja=$(printf "%04d" $((10#${zadnja:-0} + 1)))

# Opis v slug: male črke, šumniki brez strešic, presledki v pomišljaje.
slug=$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]' \
  | sed -e 's/č/c/g; s/š/s/g; s/ž/z/g; s/ć/c/g; s/đ/d/g' \
        -e 's/[^a-z0-9]\{1,\}/-/g; s/^-//; s/-$//')

cilj="$mapa/$naslednja-$slug.md"

if [ -e "$cilj" ]; then
  echo "Datoteka $cilj že obstaja." >&2
  exit 1
fi

cp "$predloga" "$cilj"
echo "${cilj#"$koren"/}"
