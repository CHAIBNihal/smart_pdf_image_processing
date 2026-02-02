// src/kafka/kafka-consumer.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { kafkaConfig } from '../config/kafka.config';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka(kafkaConfig);
    this.consumer = this.kafka.consumer({ groupId: kafkaConfig.groupId });
  }

  async onModuleInit() {
    await this.connect();
    await this.subscribeToTopics();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    await this.consumer.connect();
    console.log('✅ Kafka consumer connected');
  }

  private async disconnect() {
    await this.consumer.disconnect();
    console.log('🛑 Kafka consumer disconnected');
  }

  private async subscribeToTopics() {
    const topics = ['paiement-topic'];

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        await this.handleMessage(topic, partition, message);
      },
    });
  }

  private async handleMessage(topic: string, partition: number, message: any) {
    try {
      if (!message.value) {
        console.warn(`⚠️ Message vide reçu sur ${topic}`);
        return;
      }

      //  Kafka envoie souvent un Buffer
      const rawValue =
        message.value instanceof Buffer
          ? message.value.toString('utf-8')
          : message.value;

      console.log(`📩 Message reçu [${topic}]`, {
        offset: message.offset,
        partition,
        rawValue,
      });

      // 🔍 Tentative de parsing JSON si possible
      let parsedData: any;
      try {
        parsedData = JSON.parse(rawValue);
      } catch {
        parsedData = rawValue; // en cas si les données distribuer est pas du json
      }

      await this.processMessage(topic, parsedData);

    } catch (error) {
      console.error('❌ Erreur de traitement Kafka:', error);
    }
  }

  private async processMessage(topic: string, data: any) {
    console.log('➡️ Processing topic:', topic);

    switch (topic) {
      case 'paiement-topic':
        await this.handlePaiementTopic(data);
        break;

      default:
        console.log(`Topic non géré: ${topic}`);
    }
  }

  private async handlePaiementTopic(data: any) {
    console.log('💳 Paiement event reçu:', data);

    if (typeof data !== 'object') {
      console.warn('Format inattendu pour paiement-topic');
      return;
    }

    switch (data) {
      case 'SUCCESS':
        console.log('✅ Paiement confirmé');
        break;

      case 'FAILED':
        console.log('❌ Paiement échoué');
        break;

      default:
        console.log('⏳ Paiement en attente...');
    }
  }

  // Souscription dynamique
  async subscribe(topic: string) {
    await this.consumer.subscribe({ topic, fromBeginning: false });
    console.log(`📡 Subscribed to topic: ${topic}`);
  }
}
