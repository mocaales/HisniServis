#!/usr/bin/env bash
# PostToolUse hook: po urejanju .js/.jsx datoteke v frontend/ ali backend/
# zažene `eslint --fix` samo na tej datoteki.
# Izhod 2 + stderr: Claude Code agentu vrne napake, ki jih mora popraviti.
set -uo pipefail

vhod="$(cat)"
datoteka="$(printf '%s' "$vhod" | node -e '
  let s = "";
  process.stdin.on("data", (d) => (s += d)).on("end", () => {
    try {
      const j = JSON.parse(s);
      process.stdout.write(j.tool_input?.file_path ?? "");
    } catch {}
  });
')"

[ -z "$datoteka" ] && exit 0

case "$datoteka" in
  *.js|*.jsx) ;;
  *) exit 0 ;;
esac

koren="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"
relativna="${datoteka#"$koren"/}"

case "$relativna" in
  frontend/*) del="frontend" ;;
  backend/*) del="backend" ;;
  *) exit 0 ;;
esac

case "$relativna" in
  */node_modules/*|*/dist/*|*/coverage/*) exit 0 ;;
esac

[ -f "$koren/$relativna" ] || exit 0
[ -x "$koren/$del/node_modules/.bin/eslint" ] || exit 0

cd "$koren/$del" || exit 0
if ! izpis="$(./node_modules/.bin/eslint --fix --max-warnings 0 "${relativna#"$del"/}" 2>&1)"; then
  {
    echo "ESLint ($del) je po urejanju $relativna našel napake, ki jih ni mogel samodejno popraviti:"
    echo "$izpis"
    echo "Popravi jih, preden nadaljuješ (ne uporabljaj eslint-disable)."
  } >&2
  exit 2
fi

exit 0
