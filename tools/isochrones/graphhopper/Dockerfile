FROM iboates/osmium:latest AS osmium

FROM amazoncorretto:21-alpine

# Install package
RUN apk --no-cache add wget \
    bash \
    zip \
    nlohmann-json \
    libosmium \
    protozero \
    rapidjson \
    boost \
    bzip2 \
    zlib \
    lz4-dev \
    expat

COPY --from=osmium /usr/local/bin/osmium /usr/local/bin/osmium

# Install python and download require dependencies
RUN apk add --no-cache python3 py3-pip 

# Install go
WORKDIR /go
RUN wget https://go.dev/dl/go1.23.4.linux-amd64.tar.gz
RUN tar -C /usr/local -xzf go1.23.4.linux-amd64.tar.gz
ENV PATH="$PATH:/usr/local/go/bin"
RUN go install github.com/public-transport/gtfsclean@latest

# Copy folder
COPY data /data
COPY scripts /scripts

WORKDIR /scripts
RUN pip install --upgrade --break-system-packages -r requirements.txt


WORKDIR /graphhopper

# Get graphhopper
RUN wget https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/9.1/graphhopper-web-9.1.jar

COPY entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

ENTRYPOINT ["/graphhopper/entrypoint.sh"]