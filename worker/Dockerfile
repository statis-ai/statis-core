FROM python:3.11-slim

WORKDIR /statis

# Worker imports from the api package — install api dependencies
COPY api/requirements.txt /tmp/api_requirements.txt
RUN pip install --no-cache-dir -r /tmp/api_requirements.txt && \
    pip install --no-cache-dir watchdog pyyaml

# Copy api package (adapter modules, models, config)
COPY api/ api/

# Copy worker
COPY worker/ worker/

ENV PYTHONPATH=/statis/api

CMD ["python", "worker/execute.py"]
