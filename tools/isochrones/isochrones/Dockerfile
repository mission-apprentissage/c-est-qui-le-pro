FROM alpine:3.22.1

RUN apk add --no-cache python3 py3-pip 

WORKDIR /scripts

COPY scripts /scripts

RUN pip install --upgrade --break-system-packages -r requirements.txt

RUN chmod +x /scripts/docker-entrypoint.sh

ENTRYPOINT ["/scripts/docker-entrypoint.sh", "pt"]