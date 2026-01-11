import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement AVANT tout
dotenv.config();
@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
    this.bucketName = process.env.SUPABASE_STORAGE_BUCKET!;
  }

  getClient(): SupabaseClient {
    
    return this.supabase;
  }

  getBucketName(): string {
    return this.bucketName;
  }
}