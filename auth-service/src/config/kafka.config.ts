
export const kafkaConfig = {
  clientId: 'nestjs-consumer',
  brokers: ['kafka:9092'], 
  groupId: 'authconsumer-group', 
};