var winston = require('winston');

    var logger = new winston.Logger({
      transports: [
        new winston.transports.File({
          json: true,
          filename:'log.log'
        }),
        new winston.transports.Console()
      ],
      exitOnError: false
    });

   logger.log('info', 'some msg');
