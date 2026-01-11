import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';  
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)
  constructor() {
    // const adapter = new PrismaMariaDb({
    //   host: process.env.DB_HOST || 'localhost',
    //   port: parseInt(process.env.DB_PORT || '3306'),
    //   user: process.env.DB_USER || 'root',
    //   password: process.env.DB_PASSWORD || 'root',
    //   database: process.env.DB_NAME || 'testapp',
    //   connectionLimit: 5,
    // });
     const adapter = new PrismaMariaDb({
      host: 'mysql',              // Nom du service dans docker-compose
      port: 3306,                 // Port INTERNE du conteneur (pas 3307)
      user: 'fastapi',            // Utilisateur de votre DATABASE_URL
      password: 'fastapi123',     // Mot de passe de votre DATABASE_URL
      database: 'testapp',        // Base de données de votre DATABASE_URL
      connectionLimit: 10,        // Correspond à connection_limit dans l'URL
      connectTimeout: 30000,      // 10 secondes (connect_timeout=10)
      idleTimeout : 600000, 
      socketPath : undefined
    });

    super({
      adapter,
      log: [
        // 'query',
         'error', 
         'warn'],
    });
  }

  async onModuleInit() {
    const maxRetries = 5;
    let currentRetry = 0;

    while (currentRetry < maxRetries) {
      try {
        this.logger.log(`Tentative de connexion à la base de données... (${currentRetry + 1}/${maxRetries})`);
        await this.$connect();
        this.logger.log('✅ Connexion à la base de données réussie');
        return;
      } catch (error) {
        currentRetry++;
        this.logger.error(`❌ Échec de la connexion (tentative ${currentRetry}/${maxRetries}):`, error.message);
        
        if (currentRetry >= maxRetries) {
          this.logger.error('❌ Nombre maximum de tentatives atteint. Arrêt du service.');
          throw error;
        }
        
        // Attendre avant de réessayer (backoff exponentiel)
        const waitTime = Math.min(1000 * Math.pow(2, currentRetry), 10000);
        this.logger.log(`⏳ Nouvelle tentative dans ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }


  async onModuleDestroy() {
    await this.$disconnect();
  }
}


// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
//   constructor() {
//     super({
      
//       log: ['error', 'warn'],
//       // Supprimez l'option engine si vous n'utilisez pas Prisma Accelerate
//       // Ou configurez l'adapter/accelerateUrl si nécessaire
//     });
//   }

//   async onModuleInit() {
//     await this.$connect();
//   }

//   async onModuleDestroy() {
//     await this.$disconnect();
//   }
// }


