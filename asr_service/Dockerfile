# DeepSpeech 0.9.3 published wheels for Python 3.6 / 3.7 / 3.8 / 3.9 on
# Linux x86_64. Use 3.9-slim — broadest compatibility.
FROM python:3.9-slim

# ffmpeg is required by pydub to decode browser audio (webm/ogg/mp4) into
# the 16 kHz mono PCM the model needs.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=5005
EXPOSE 5005

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5005"]
