#!/usr/bin/env python3
"""生成结算页的示例胜利曲 assets/music/victory.wav（无第三方依赖）。

用法（仓库根目录）：python3 tools/make-victory-music.py
换成自己的音乐时，直接把 mp3 放进 assets/music/ 并修改 data/music.js 即可。
"""
import math
import os
import struct
import wave

SR = 22050
DURATION = 4.6

# (频率, 开始秒, 时长秒)
MELODY = [
    (392.00, 0.00, 0.13),  # G4
    (523.25, 0.13, 0.13),  # C5
    (659.25, 0.26, 0.13),  # E5
    (783.99, 0.39, 0.30),  # G5
    (659.25, 0.69, 0.13),
    (783.99, 0.82, 0.36),
    (880.00, 1.18, 0.13),  # A5
    (783.99, 1.31, 0.13),
    (698.46, 1.44, 0.13),  # F5
    (659.25, 1.57, 0.24),
    (587.33, 1.81, 0.13),  # D5
    (659.25, 1.94, 0.55),
    (523.25, 2.60, 0.12),
    (659.25, 2.72, 0.12),
    (783.99, 2.84, 0.12),
    (1046.50, 2.96, 0.50),  # C6
    (523.25, 3.46, 0.90),   # 结尾和弦
    (659.25, 3.46, 0.90),
    (783.99, 3.46, 0.90),
]

BASS = [
    (130.81, 0.00, 0.80),  # C3
    (196.00, 1.18, 0.70),  # G3
    (130.81, 2.60, 0.90),
    (130.81, 3.46, 0.90),
]


def square(t, freq, duty):
    phase = (t * freq) % 1.0
    return 1.0 if phase < duty else -1.0


def envelope(t, dur):
    attack = min(1.0, t / 0.008)
    release = min(1.0, max(0.0, (dur - t) / 0.06))
    decay = 1.0 - 0.5 * (t / dur)
    return attack * release * decay


def render():
    total = int(SR * DURATION)
    buf = [0.0] * total

    for freq, start, dur in MELODY:
        i0 = int(start * SR)
        n = int(dur * SR)
        for i in range(n):
            t = i / SR
            buf[i0 + i] += 0.20 * square(t, freq, 0.25) * envelope(t, dur)

    for freq, start, dur in BASS:
        i0 = int(start * SR)
        n = int(dur * SR)
        for i in range(n):
            t = i / SR
            buf[i0 + i] += 0.10 * square(t, freq, 0.5) * envelope(t, dur)

    peak = max(abs(v) for v in buf) or 1.0
    scale = 0.85 / peak
    return [v * scale for v in buf]


def main():
    samples = render()
    out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'music')
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, 'victory.wav')

    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = b''.join(struct.pack('<h', int(max(-1.0, min(1.0, v)) * 32767)) for v in samples)
        w.writeframes(frames)

    print('已生成 %s（%.1f 秒，%d 字节）' % (os.path.relpath(path), DURATION, os.path.getsize(path)))


if __name__ == '__main__':
    main()
