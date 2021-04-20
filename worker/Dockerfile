FROM ubuntu:20.04 

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update -y

# RUN adduser --disabled-password --gecos "" judge

# for gcc 
RUN apt install curl vim build-essential -y

# for jdk
RUN apt-get install openjdk-8-jdk -y

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash 
RUN apt-get install nodejs -y
# RUN apt install npm -y

# Create app directory
WORKDIR /usr/src/app


# copying everything from the app dir to the working dir
COPY ./app .

# installing the dependencies in the working dir
RUN npm install

# making a temp folder in working dir
RUN mkdir temp

# # exposing port 3000
# EXPOSE 3000

# running the worker
CMD [ "node" , "app.js" ]