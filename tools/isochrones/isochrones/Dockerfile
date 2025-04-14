FROM debian:bookworm-slim

RUN apt-get update
RUN apt-get -y install jq parallel curl

WORKDIR /scripts

COPY scripts /scripts

ENTRYPOINT ["bash", "/scripts/docker-entrypoint.sh", "pt", "bike"]