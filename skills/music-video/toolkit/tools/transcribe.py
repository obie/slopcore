#!/usr/bin/env python3
"""transcribe.py <project> [lang] — what is actually sung: Whisper large-v3 on the vocal stem, with word times.
lang is a Whisper language code (en, es, ...); without it Whisper detects the language. WHISPER_PROMPT (environment)
is an optional initial prompt: names and unusual words that occur in the lyric, to bias the transcript.

Writes media/audio/whisper.json ({segments: [{start, end, text, words: [{word, start, end, probability}]}]}) and prints
one line per segment. This is the check on the lyric sheet; align.py then places the known lyric on the vocal.
"""
import sys
if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
import json, os, pathlib
import mlx_whisper

P = pathlib.Path(sys.argv[1]).resolve()
lang = sys.argv[2] if len(sys.argv) > 2 else None   # None: Whisper detects the language
vocals = P / 'media/audio/stems_raw/htdemucs/song/vocals.wav'
r = mlx_whisper.transcribe(str(vocals), path_or_hf_repo='mlx-community/whisper-large-v3-mlx', language=lang,
                           word_timestamps=True, condition_on_previous_text=False, temperature=0.0,
                           initial_prompt=os.environ.get('WHISPER_PROMPT') or None)
segs = [{'start': round(s['start'], 3), 'end': round(s['end'], 3), 'text': s['text'].strip(),
         'words': [{'word': w['word'].strip(), 'start': round(float(w['start']), 3), 'end': round(float(w['end']), 3),
                    'probability': round(float(w.get('probability', 0)), 3)} for w in s.get('words', [])]} for s in r['segments']]
(P / 'media/audio/whisper.json').write_text(json.dumps({'language': lang, 'segments': segs}, ensure_ascii=False, indent=1))
for s in segs: print(f"{s['start']:7.2f} {s['end']:7.2f}  {s['text']}")
