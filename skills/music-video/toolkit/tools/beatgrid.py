#!/usr/bin/env python3
"""beatgrid.py <project> — measure the song's beat grid on the drum stem and write media/audio/beatmap.json.

The beat is the kick. A constant-tempo grid (beat n at t0 + n * period) is fitted to low-band onsets of the
drum stem, then checked for drift by fitting the first and second halves separately. The downbeat phase is
the one where harmonic change (bass + other) and section energy steps are strongest.
"""
import sys
if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'): sys.exit(__doc__)
import json, pathlib
import numpy as np, librosa, scipy.signal as sg

P = pathlib.Path(sys.argv[1]).resolve()
STEMS = P / 'media/audio/stems_raw/htdemucs/song'
SR = 22050
HOP = 64  # 2.9 ms

def load(name):
    y, _ = librosa.load(STEMS / f'{name}.wav', sr=SR, mono=True)
    return y

drums = load('drums')
dur = len(drums) / SR

# kick band onset envelope
sos = sg.butter(4, [35, 130], btype='band', fs=SR, output='sos')
kick = sg.sosfiltfilt(sos, drums)
env = librosa.onset.onset_strength(y=kick, sr=SR, hop_length=HOP, aggregate=np.median, n_mels=24, fmax=400)
env = env / (env.max() + 1e-9)
t_env = librosa.frames_to_time(np.arange(len(env)), sr=SR, hop_length=HOP)

# coarse tempo, then a comb search around it and its half/double
full_env = librosa.onset.onset_strength(y=drums, sr=SR, hop_length=512)
coarse = float(np.atleast_1d(librosa.feature.tempo(onset_envelope=full_env, sr=SR, hop_length=512))[0])

def comb_score(bpm, e=env, t=t_env):
    period = 60.0 / bpm
    best = (-1, 0.0)
    for ph in np.linspace(0, period, 96, endpoint=False):
        grid = np.arange(ph, t[-1], period)
        idx = np.clip(np.searchsorted(t, grid), 0, len(e) - 1)
        s = e[idx].mean()
        if s > best[0]: best = (s, ph)
    return best

cands = []
for base in (coarse / 2, coarse, coarse * 2):
    if 60 <= base <= 200:
        for bpm in np.arange(base - 3, base + 3, 0.05):
            s, ph = comb_score(bpm); cands.append((s, bpm, ph))
s0, bpm0, ph0 = max(cands)
# refine
fine = [(comb_score(b)[0], b) for b in np.arange(bpm0 - 0.1, bpm0 + 0.1, 0.002)]
bpm = max(fine)[1]

# exact kick onsets (peaks of the kick envelope), then a least-squares line through the ones near the grid
peaks, _ = sg.find_peaks(env, height=0.25, distance=int(0.2 * SR / HOP))
kt = t_env[peaks]
period = 60.0 / bpm
_, ph = comb_score(bpm)
n = np.round((kt - ph) / period)
res = kt - (ph + n * period)
keep = np.abs(res) < 0.03
A = np.vstack([n[keep], np.ones(keep.sum())]).T
period, t0 = np.linalg.lstsq(A, kt[keep], rcond=None)[0]
bpm = 60.0 / period
t0 = t0 % period
res = kt[keep] - (t0 + np.round((kt[keep] - t0) / period) * period)

def fit_half(lo, hi):
    m = keep & (kt >= lo) & (kt < hi)
    if m.sum() < 8: return None
    nn = np.round((kt[m] - t0) / period)
    p, _ = np.linalg.lstsq(np.vstack([nn, np.ones(m.sum())]).T, kt[m], rcond=None)[0]
    return 60.0 / p

# downbeat phase: harmonic novelty of bass+other at each beat, summed per phase (mod 4)
harm = load('bass') + load('other')
chroma = librosa.feature.chroma_cqt(y=harm, sr=SR, hop_length=512)
tc = librosa.frames_to_time(np.arange(chroma.shape[1]), sr=SR, hop_length=512)
nbeats = int((dur - t0) / period)
beats = t0 + np.arange(nbeats) * period
def seg(a, b):
    i, j = np.searchsorted(tc, [a, b]); j = max(j, i + 1)
    v = chroma[:, i:j].mean(axis=1); return v / (np.linalg.norm(v) + 1e-9)
nov = np.array([1 - float(seg(b - period, b) @ seg(b, b + period)) for b in beats[1:-1]])
phase_scores = [float(nov[(k - 1) % 4::4].mean()) for k in range(4)]
down = int(np.argmax(phase_scores))

out = {
    'duration': round(dur, 3), 'bpm': round(float(bpm), 4), 'period': round(float(period), 6),
    't0': round(float(t0), 4), 'downbeat_phase': down, 'bar': round(float(period * 4), 6),
    'bar0': round(float(t0 + down * period), 4),
    'kicks_on_grid': int(keep.sum()), 'kicks_found': int(len(kt)),
    'residual_ms_iqr': [round(float(x) * 1000, 2) for x in np.percentile(res, [25, 75])],
    'bpm_first_half': fit_half(0, dur / 2), 'bpm_second_half': fit_half(dur / 2, dur),
    'downbeat_phase_scores': [round(x, 4) for x in phase_scores], 'coarse_bpm': round(coarse, 2),
}
(P / 'media/audio/beatmap.json').write_text(json.dumps(out, indent=1))
print(json.dumps(out, indent=1))
