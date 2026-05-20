# Deploying AyahQuest to Google Cloud — from zero

This walks you all the way through, assuming you've never used Google Cloud
or the `gcloud` CLI before. You'll end up with two services running on
**Cloud Run**:

```
  Internet ──HTTPS──▶  ayahquest-api  (Node + Vite build)
                            │
                            └──HTTPS──▶ ayahquest-asr (Python faster-whisper)
```

Both services scale to zero when idle and only cost while traffic hits
them (subject to free-tier limits — see "Cost notes" at the end).

> Heads-up — your environment: macOS. Every command below assumes Terminal
> on a Mac. Where Linux/Windows differs I'll call it out.

---

## Part 0 — One-time prerequisites

### 0.1 — A Google account + a credit card

1. You need a Google account (the one you use for Gmail is fine).
2. You need to attach a credit card / debit card to enable billing. Google
   gives **$300 of free credit for 90 days** on new accounts, plus a
   permanent free tier on Cloud Run. You will NOT be charged automatically
   when the trial ends — you have to upgrade manually.
3. Sign up at <https://cloud.google.com/free> if you haven't already.

### 0.2 — Install Homebrew (skip if you have it)

Open Terminal and paste:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

When it finishes, follow the printed "Next steps" — it will tell you to
run an `eval` line so `brew` is on your PATH. Verify:

```bash
brew --version
```

### 0.3 — Install the Google Cloud CLI

```bash
brew install --cask google-cloud-sdk
```

If you'd rather not use Homebrew, download the installer instead:
<https://cloud.google.com/sdk/docs/install-sdk>. The installer adds gcloud
to your PATH and prompts you to sign in.

Verify:

```bash
gcloud --version
```

You should see `Google Cloud SDK 4xx.0.0` plus a list of bundled
components. If `gcloud: command not found`, open a NEW Terminal window —
Homebrew updates your PATH only in fresh shells.

### 0.4 — Sign in and create a project

```bash
# Opens a browser; sign in with the Google account from step 0.1
gcloud auth login

# Picks a unique project id. Project ids are GLOBAL across all GCP — try
# something like "ayahquest-<your-initials>-<2-digit-suffix>".
# Lowercase, digits, hyphens; 6–30 chars; cannot be changed later.
PROJECT_ID="ayahquest-$(whoami)-01"
gcloud projects create "$PROJECT_ID" --name="AyahQuest"

# Make it the default project for everything that follows.
gcloud config set project "$PROJECT_ID"
```

If `create` fails with "the project ID … is already in use", just pick a
different suffix and try again.

### 0.5 — Link a billing account

This step has to happen in the web console the first time (the API needs
an existing billing account to link).

1. Open <https://console.cloud.google.com/billing>.
2. Click **Create account** (or pick an existing one if you have one).
3. Fill in your card + address.
4. Go to <https://console.cloud.google.com/billing/projects>, find your
   project, click **Change billing**, and link it to the account.

Confirm from the CLI:

```bash
gcloud beta billing projects describe "$PROJECT_ID"
# look for: billingEnabled: true
```

### 0.6 — Set a budget alert (do this BEFORE deploying anything)

Whisper + Cloud Run can quietly burn $20–50/month if you forget about an
always-on instance. Set a $10/month alert now.

1. <https://console.cloud.google.com/billing/budgets>
2. **Create budget** → name it "ayahquest-alert" → scope to your project
   → amount **USD 10/month** → alert at **50%, 90%, 100%** → save.

You will get an email if you cross the threshold. It does NOT shut
services down — but you'll know.

---

## Part 1 — Enable the APIs you need

Three Google APIs power this deploy: Cloud Run (host the services),
Artifact Registry (store container images), and Cloud Build (build images
without needing Docker locally).

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

This takes ~30 seconds.

Pick a region. Closer to your users = lower latency. Most of the world
sees `us-central1` as cheap and reliable; for Middle East users
`europe-west1` is closer.

```bash
REGION="us-central1"   # change if you like
gcloud config set run/region "$REGION"
gcloud config set artifacts/location "$REGION"
```

---

## Part 2 — Create an Artifact Registry repo for your images

```bash
gcloud artifacts repositories create ayahquest \
  --repository-format=docker \
  --location="$REGION" \
  --description="AyahQuest container images"
```

Confirm:

```bash
gcloud artifacts repositories list
```

Your image path prefix is now:

```
${REGION}-docker.pkg.dev/${PROJECT_ID}/ayahquest
```

Stash that as a shell var so the commands below stay readable:

```bash
IMAGE_PREFIX="${REGION}-docker.pkg.dev/${PROJECT_ID}/ayahquest"
echo "$IMAGE_PREFIX"
```

---

## Part 3 — Fix the two Dockerfiles for Cloud Run

Cloud Run injects `$PORT` (usually 8080) and expects your container to
listen on it. The repo's Dockerfiles need two tiny tweaks before they
work cleanly.

### 3.1 — ASR Dockerfile

Open `asr_service/Dockerfile` and change the final `CMD` line from:

```dockerfile
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5005"]
```

to (shell form, so `$PORT` is expanded):

```dockerfile
CMD python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-5005}
```

Also — strongly recommended — pre-bake the Whisper checkpoint into the
image so cold starts don't have to re-download ~500 MB every time:

```dockerfile
# Right after `RUN pip install --no-cache-dir -r requirements.txt`
RUN python -c "from faster_whisper import WhisperModel; \
  WhisperModel('small', device='cpu', compute_type='int8')"
```

This makes the image bigger (~700 MB) but cold-start drops from
~60 seconds to ~5 seconds.

### 3.2 — API Dockerfile (the root `Dockerfile`)

It already uses `npm start`, and the Node server already reads
`process.env.PORT`. No changes needed — but for clarity, drop the
`EXPOSE 4000` line (Cloud Run ignores `EXPOSE` and uses `$PORT` instead).

---

## Part 4 — Build and push the ASR image (Cloud Build does it for you)

You do NOT need Docker installed on your Mac for this. `gcloud builds`
ships your source to Google's builders, which build the image and push
it to your Artifact Registry.

```bash
cd asr_service
gcloud builds submit --tag "${IMAGE_PREFIX}/asr:v1" .
cd ..
```

This usually takes 5–10 minutes the first time (downloading the Whisper
checkpoint inside the build). You'll see streaming logs. Success looks
like `STATUS: SUCCESS` at the end and a SHA-256 image digest.

---

## Part 5 — Deploy the ASR service to Cloud Run

```bash
gcloud run deploy ayahquest-asr \
  --image "${IMAGE_PREFIX}/asr:v1" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --concurrency 4 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "ASR_MODEL_SIZE=small,ASR_DEVICE=cpu,ASR_COMPUTE_TYPE=int8"
```

What each flag does:

- `--memory 2Gi --cpu 2` — Whisper needs RAM; less than 2 GiB will OOM.
- `--timeout 300` — request timeout. Audio uploads + transcription can
  take 20 s for long clips.
- `--concurrency 4` — limit simultaneous transcribes per instance so
  CPU contention stays sane.
- `--min-instances 0` — scale to zero when idle (free). Set to `1` if
  you want to avoid cold-start latency, but you'll pay ~$15/month for
  the always-on instance.
- `--allow-unauthenticated` — keep it simple for now. The API service
  will call it over public HTTPS. (Tighter setup is in "Hardening" at
  the end.)

When it finishes, grab the public URL:

```bash
ASR_URL=$(gcloud run services describe ayahquest-asr \
  --region "$REGION" \
  --format='value(status.url)')
echo "$ASR_URL"
# e.g. https://ayahquest-asr-abc123-uc.a.run.app
```

Test it:

```bash
curl "${ASR_URL}/health"
# {"status":"ok","model_loaded":true,"model_path":"faster-whisper/small","sample_rate":16000}
```

First call after deploy might take 30–60 s (cold start). Subsequent
calls are fast.

---

## Part 6 — Build and push the API + client image

```bash
gcloud builds submit --tag "${IMAGE_PREFIX}/api:v1" .
```

This builds from the repo root using the existing `Dockerfile`. It
compiles the Vite client and bundles it into the Node image. Takes 3–5
minutes the first time.

---

## Part 7 — Deploy the API service, pointing it at the ASR

```bash
gcloud run deploy ayahquest-api \
  --image "${IMAGE_PREFIX}/api:v1" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --concurrency 80 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars "NODE_ENV=production,ASR_URL=${ASR_URL}"
```

(That `${ASR_URL}` is the URL you grabbed in Part 5.)

Grab the API URL:

```bash
API_URL=$(gcloud run services describe ayahquest-api \
  --region "$REGION" \
  --format='value(status.url)')
echo "$API_URL"
```

Open it in a browser. You should see the AyahQuest home screen.

Check the health endpoint and confirm it can talk to the ASR:

```bash
curl "${API_URL}/api/health" | python3 -m json.tool
# Look for:  "asr": { "available": true, "model_loaded": true, "url": "https://…asr…" }
```

If `available: false`, jump to "Troubleshooting" at the bottom.

---

## Part 8 — Optional but recommended: add Quran Foundation + Gemini keys

If you've signed up for Quran Foundation Content API or Gemini, set
those keys as env vars. Adding env vars is non-destructive — only the
keys you mention are touched.

```bash
gcloud run services update ayahquest-api \
  --region "$REGION" \
  --update-env-vars "QF_CLIENT_ID=your_id,QF_CLIENT_SECRET=your_secret,QF_ENV=production,GEMINI_API_KEY=your_gemini_key,GEMINI_MODEL=gemini-1.5-flash"
```

For secrets it's slightly better to use **Secret Manager** so values
aren't visible in `gcloud run describe`. Two extra commands:

```bash
echo -n "your_gemini_key" | gcloud secrets create GEMINI_API_KEY --data-file=-
gcloud run services update ayahquest-api \
  --region "$REGION" \
  --update-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

---

## Part 9 — Custom domain (optional)

If you own a domain and want `app.example.com` instead of the
`*.run.app` URL:

1. <https://console.cloud.google.com/run/domains> → **Add Mapping**.
2. Pick `ayahquest-api`, type your domain, follow the DNS record
   instructions Google shows you (a `CNAME` to `ghs.googlehosted.com`
   or A-records for an apex).
3. SSL is automatic once DNS propagates (10 min – 1 hr).

---

## Deploying updates later

After changing code, redeploy is just two commands per service:

```bash
# API
gcloud builds submit --tag "${IMAGE_PREFIX}/api:v2" .
gcloud run deploy ayahquest-api \
  --image "${IMAGE_PREFIX}/api:v2" --region "$REGION"

# ASR (only when asr_service/ changes)
cd asr_service
gcloud builds submit --tag "${IMAGE_PREFIX}/asr:v2" .
cd ..
gcloud run deploy ayahquest-asr \
  --image "${IMAGE_PREFIX}/asr:v2" --region "$REGION"
```

Bump the `:vN` tag each time so old revisions stay in the registry and
you can roll back.

### Rolling back a bad deploy

```bash
# Show the last few revisions
gcloud run revisions list --service ayahquest-api --region "$REGION"

# Send 100% of traffic back to the previous one
gcloud run services update-traffic ayahquest-api \
  --to-revisions ayahquest-api-00002-xyz=100 --region "$REGION"
```

### Tailing logs

```bash
gcloud run services logs tail ayahquest-api --region "$REGION"
gcloud run services logs tail ayahquest-asr --region "$REGION"
```

---

## Cost notes

With `--min-instances 0` on both services, you pay only for actual
request time. Real numbers for a hackathon / small demo:

| What                         | Cost per month (idle)  | Cost under light load |
|------------------------------|------------------------|------------------------|
| API service (scale to zero)  | $0                     | a few cents            |
| ASR service (scale to zero)  | $0                     | $1–5                   |
| Artifact Registry storage    | ~$0.10 (~1 GB images)  | ~$0.10                 |
| Cloud Build minutes          | $0 first 120 min/day   | depends                |

The big cost trap is `--min-instances=1` on the ASR with 2 GiB / 2 CPU
— that's about **$15/month** even with zero traffic, because Google
charges for the always-on instance. Only set that if cold-start latency
is actually unacceptable.

Free-tier limits (per month): 2 million Cloud Run requests, 360,000
vCPU-seconds, 180,000 GiB-seconds memory. Way more than a demo uses.

---

## Hardening (do these before going public)

1. **Restrict who can call the ASR.** Right now it's
   `--allow-unauthenticated`, so anyone with the URL can hit it. Lock it
   down so only the API service can:

   ```bash
   # Create a dedicated service account the API uses to call the ASR.
   gcloud iam service-accounts create api-to-asr

   # Grant it permission to invoke the ASR.
   gcloud run services add-iam-policy-binding ayahquest-asr \
     --member "serviceAccount:api-to-asr@${PROJECT_ID}.iam.gserviceaccount.com" \
     --role "roles/run.invoker" --region "$REGION"

   # Run the API as that service account.
   gcloud run services update ayahquest-api \
     --service-account "api-to-asr@${PROJECT_ID}.iam.gserviceaccount.com" \
     --region "$REGION"

   # Remove public access from the ASR.
   gcloud run services update ayahquest-asr \
     --no-allow-unauthenticated --region "$REGION"
   ```

   You'd then need to add a small `Authorization: Bearer <id-token>`
   header in the API's `transcribeAudio()` call. (Happy to wire that in
   when you're ready to harden.)

2. **Switch user storage off JSON files.** Right now `server/data/users.json`
   gets reset every time the API container restarts. For real users
   you want Firestore or Cloud SQL — your `package.json` already lists
   `firebase-admin`, so the wiring is half there.

3. **Cloud Armor / rate-limiting** if you put it in front of the open
   internet, to protect against abuse of the Whisper endpoint.

---

## Troubleshooting

### `/api/health` shows `asr.available: false`

```bash
# 1. Is the ASR service alive on its own?
curl "${ASR_URL}/health"
# Should be 200 with model_loaded: true.

# 2. Did the API actually get the ASR_URL env var?
gcloud run services describe ayahquest-api --region "$REGION" \
  --format='get(spec.template.spec.containers[0].env)'
```

If `ASR_URL` is missing, re-run the deploy with `--set-env-vars`.

### "Container failed to start. Listening on the wrong port."

Cloud Run sets `PORT=8080`. Make sure neither container hardcodes a
different port. The fixes in Part 3 cover both Dockerfiles.

### ASR cold start > 4 minutes (timeout error)

Either bake the model into the image (Part 3.1) or set
`--min-instances 1` and accept the $15/month cost.

### "Permission denied" when running gcloud

```bash
gcloud auth login
gcloud config set project "$PROJECT_ID"
```

### Want to start over fresh

```bash
gcloud run services delete ayahquest-api --region "$REGION"
gcloud run services delete ayahquest-asr --region "$REGION"
gcloud artifacts repositories delete ayahquest --location "$REGION"
gcloud projects delete "$PROJECT_ID"   # nukes everything
```

---

## Quick reference — every command, in order

```bash
# 0. Install
brew install --cask google-cloud-sdk
gcloud auth login

# 1. Project
PROJECT_ID="ayahquest-$(whoami)-01"
gcloud projects create "$PROJECT_ID" --name="AyahQuest"
gcloud config set project "$PROJECT_ID"
# (link billing in console; set a $10 budget alert)

# 2. APIs + region
REGION="us-central1"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
gcloud config set run/region "$REGION"
gcloud config set artifacts/location "$REGION"

# 3. Registry
gcloud artifacts repositories create ayahquest \
  --repository-format=docker --location="$REGION"
IMAGE_PREFIX="${REGION}-docker.pkg.dev/${PROJECT_ID}/ayahquest"

# 4. Build + deploy ASR
cd asr_service
gcloud builds submit --tag "${IMAGE_PREFIX}/asr:v1" .
cd ..
gcloud run deploy ayahquest-asr \
  --image "${IMAGE_PREFIX}/asr:v1" --region "$REGION" \
  --allow-unauthenticated --memory 2Gi --cpu 2 --timeout 300 \
  --concurrency 4 --min-instances 0 --max-instances 3 \
  --set-env-vars "ASR_MODEL_SIZE=small,ASR_DEVICE=cpu,ASR_COMPUTE_TYPE=int8"
ASR_URL=$(gcloud run services describe ayahquest-asr \
  --region "$REGION" --format='value(status.url)')

# 5. Build + deploy API
gcloud builds submit --tag "${IMAGE_PREFIX}/api:v1" .
gcloud run deploy ayahquest-api \
  --image "${IMAGE_PREFIX}/api:v1" --region "$REGION" \
  --allow-unauthenticated --memory 512Mi --cpu 1 --timeout 60 \
  --concurrency 80 --min-instances 0 --max-instances 5 \
  --set-env-vars "NODE_ENV=production,ASR_URL=${ASR_URL}"
API_URL=$(gcloud run services describe ayahquest-api \
  --region "$REGION" --format='value(status.url)')

# 6. Verify
open "$API_URL"
```
