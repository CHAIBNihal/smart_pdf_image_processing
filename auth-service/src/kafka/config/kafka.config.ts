
export const kafkaConfig = {
  clientId: 'nestjs-consumer',
  brokers: [process.env.KAFKA_BROKERS || 'kafka:29092'],
  groupId: 'authconsumer-group', 
};

// Ajoutez ce logging
console.log('Kafka Config Loaded:', {
  brokers: kafkaConfig.brokers,
  clientId: kafkaConfig.clientId,
  groupId: kafkaConfig.groupId,
});