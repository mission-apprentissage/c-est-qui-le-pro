FROM debian:bookworm-slim

RUN apt-get update
RUN apt-get -y install jq parallel curl

COPY entrypoint.sh entrypoint.sh

ENTRYPOINT ["bash", "entrypoint.sh"]