# Notes

## Mattes

`tools/matte.py` makes the subject mattes (white = people, black = background) that `OCC.behind` reads.

- Model: BiRefNet, general weights `ZhengPeng7/BiRefNet`, run at 1024 px. `--model ZhengPeng7/BiRefNet_HR` (2048 px) is also supported.
- Licence: MIT (code and weights, https://github.com/ZhengPeng7/BiRefNet).
- Weights source: Hugging Face `ZhengPeng7/BiRefNet`, loaded with `transformers` and `trust_remote_code`, cached in the default Hugging Face cache.
- Runs locally on the Apple GPU (MPS) in float32. About 0.5 s per plate and 0.45 s per clip frame. BiRefNet_HR takes about 6 to 15 s per plate.
- Clips are matted frame by frame with a 1-2-1 blend across neighbouring frames. There is no SAM 2 propagation.
- `tragedy-wide` was made with the HR weights (the general weights drop the second waiter). `plates ... --force` regenerates with the general weights again.
