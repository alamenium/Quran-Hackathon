# faster-whisper runs cleanly on Python 3.10+. 3.11-slim gives us a
# small image with up-to-date wheels for ctranslate2 / tokenizers / numpy.
FROM python:3.11-slim

# ffmpeg is invoked as a subprocess by main.py to decode browser audio
# (webm/ogg/mp4) into 16 kHz mono PCM that Whisper expects.
# libsndfile1 is required by soundfile to read the resulting WAV.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Right after `RUN pip install --no-cache-dir -r requirements.txt`
RUN python -c "from faster_whisper import WhisperModel; \
  WhisperModel('small', device='cpu', compute_type='int8')"

COPY . .

ENV PORT=5005
# Default Whisper checkpoint. Override at run time with e.g.
#   docker run -e ASR_MODEL_SIZE=medium ...
ENV ASR_MODEL_SIZE=small

EXPOSE 5005

CMD python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-5005}

