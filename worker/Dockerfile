FROM ubuntu:20.04 

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update -y && apt-get install -y \
    curl \
    vim \
    build-essential \
    openjdk-8-jdk \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Optional: Uncomment to add a non-root user
# RUN adduser --disabled-password --gecos "" judge

# Set the working directory
WORKDIR /usr/src/app

# Copying everything from the app dir to the working dir
COPY ./app .

# Installing the dependencies in the working dir
RUN npm install

# Making a temp folder in working dir
RUN mkdir temp

# Optional: Uncomment to expose a port
# EXPOSE 3000

# Running the worker
CMD [ "node", "app.js" ]
