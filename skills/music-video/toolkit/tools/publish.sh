#!/usr/bin/env bash
# publish.sh <project> NN A:B  — check a chapter (lyrics, purity), render its draft at 1280 wide, and put it on the review page
# <project> is the project folder, relative to the workspace root (the parent of tools/); NN is the chapter number; A:B is its time range in seconds.
# Python: $PYTHON if set, else <workspace root>/.venv/bin/python if it exists, else python3.
if [[ $# -lt 3 || $1 == -h || $1 == --help ]]; then sed -n '2,4p' "$0" | cut -c3-; exit 0; fi
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; proj=${1%/}; n=$2; r=$3
PY=${PYTHON:-}; [[ -z $PY && -x $ROOT/.venv/bin/python ]] && PY=$ROOT/.venv/bin/python; PY=${PY:-python3}
cd "$ROOT/engine"; export VIDEO_PROJECT=$proj
mkdir -p "../$proj/media/render/pilot"
echo "ch$n lyrics: $($PY render.py lyrics $r --ch $n 2>&1 | tail -1)  check: $($PY render.py check $r --n 16 --ch $n 2>&1 | tail -1)"
$PY render.py video $r --ch $n --w 1280 --workers 6 --out ../$proj/media/render/ch$n-draft.mp4 2>&1 | tail -1 | cut -c1-40
ffmpeg -v error -y -i ../$proj/media/render/ch$n-draft.mp4 -c copy -movflags +faststart ../$proj/media/render/pilot/ch$n-draft.mp4
cd .. && $PY tools/mkreview.py $proj >/dev/null && $PY tools/review.py $proj | cut -c1-80
