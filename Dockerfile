FROM node

RUN mkdir /appl
RUN cd /appl 

COPY . /appl
WORKDIR /appl
RUN npm install
EXPOSE 5000
CMD [ "npm", "start" ]
