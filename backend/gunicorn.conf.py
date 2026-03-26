import os

port = os.getenv("PORT", "8000")
bind = f"0.0.0.0:{port}"

workers = 2
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 50
