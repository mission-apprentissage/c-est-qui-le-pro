FROM debian:bookworm-slim AS build

ARG GRAPHHOPPER_MEMORY_LIMIT

# Install package
RUN apt-get update
RUN apt-get -y install osmium-tool wget zip

# Install go
RUN wget https://go.dev/dl/go1.23.4.linux-amd64.tar.gz
RUN tar -C /usr/local -xzf go1.23.4.linux-amd64.tar.gz
ENV PATH="$PATH:/usr/local/go/bin"
RUN go install github.com/public-transport/gtfsclean@latest

WORKDIR /data/pbf

# Download pbf
RUN wget https://download.geofabrik.de/europe/france-latest.osm.pbf
RUN wget https://download.geofabrik.de/europe/france/martinique-latest.osm.pbf
RUN wget https://download.geofabrik.de/europe/france/guadeloupe-latest.osm.pbf 
RUN wget https://download.geofabrik.de/europe/france/mayotte-latest.osm.pbf
RUN wget https://download.geofabrik.de/europe/france/guyane-latest.osm.pbf
RUN wget https://download.geofabrik.de/europe/france/reunion-latest.osm.pbf

# Merge pbf
RUN osmium merge france-latest.osm.pbf martinique-latest.osm.pbf guadeloupe-latest.osm.pbf  mayotte-latest.osm.pbf guyane-latest.osm.pbf reunion-latest.osm.pbf -o full.osm.pbf

WORKDIR /data/gtfs
# Download and clean gtfs
COPY gtfs.sh gtfs.sh
RUN bash gtfs.sh

FROM amazoncorretto:21-alpine

ARG GRAPHHOPPER_MEMORY_LIMIT

WORKDIR /data/graphhopper

# Get graphhopper
RUN wget https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/9.1/graphhopper-web-9.1.jar

COPY --from=build /data/pbf /data/graphhopper/pbf
COPY --from=build /data/gtfs /data/graphhopper/gtfs

COPY entrypoint.sh entrypoint.sh
COPY config.yml config.yml


RUN java -Xmx${GRAPHHOPPER_MEMORY_LIMIT} -Xms${GRAPHHOPPER_MEMORY_LIMIT} -jar graphhopper-web-9.1.jar import config.yml

ENTRYPOINT ["entrypoint.sh"]