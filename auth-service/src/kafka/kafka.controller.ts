// import { Controller } from '@nestjs/common';
// import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';

// @Controller()
// export class KafkaController {

//   @EventPattern('paiement-topic')
//   async onPayementEvent(
//     @Payload() message: any,
//     @Ctx() context: KafkaContext,
//   ) {
//     // Récupération du vrai message Kafka
//     const originalMessage = context.getMessage();
//     if (!originalMessage.value) {
//       console.log('⚠️ Message Kafka sans contenu (value null)');
//       return;
//     }
//     // Le value est un Buffer → convertir en JSON
//     const data = JSON.parse(originalMessage.value.toString());

//     console.log('📩 Event reçu :', data);

//     switch (data.event) {
//       case 'SUCCESS':
//         console.log('✅ Initialisation de paiement réussie !', data);
//         break;

//       case 'FAILED':
//         console.log('❌ Initialisation de session de paiement échouée !');
//         break;

//       default:
//         console.log('⏳ La session est en cours d’initialisation...');
//     }
//   }
// }
