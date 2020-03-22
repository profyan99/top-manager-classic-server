export default {
  plugin: require('hapi-pino'),
  options: {
    prettyPrint: process.env.NODE_ENV !== 'production',
    redact: ['req.headers.authorization'],
    mergeHapiLogData: true,
    logPayload: true,
    logRequestComplete: false,
  }
};
