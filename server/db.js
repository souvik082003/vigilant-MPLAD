import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';

export async function getDb() {
  const dbPath = path.resolve(import.meta.dirname, '../data/database.sqlite');
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export async function initDb() {
  const db = await getDb();
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      work_id TEXT PRIMARY KEY,
      state TEXT,
      constituency TEXT,
      mp_name TEXT,
      work_category TEXT,
      sanction_amount REAL,
      work_status TEXT,
      analysis_mode TEXT,
      effectively_completed BOOLEAN,
      risk_score REAL,
      risk_category TEXT,
      n_signals_available INTEGER,
      split_payment_flag BOOLEAN,
      is_govt_body BOOLEAN,
      any_is_anomaly_v2 TEXT,
      any_is_anomaly_lof TEXT,
      cost_deviation_pct REAL,
      utilization_pct_completed REAL,
      recommendation_to_sanction_days REAL,
      rule_expenditure_over_sanction BOOLEAN,
      rule_extreme_delay BOOLEAN,
      rule_vendor_concentration BOOLEAN,
      known_false_positive BOOLEAN
    );

    CREATE TABLE IF NOT EXISTS state_summaries (
      state TEXT PRIMARY KEY,
      total_works INTEGER,
      works_with_sanction_data INTEGER,
      total_sanctioned_amount REAL,
      high_critical_count INTEGER,
      high_critical_rate_pct REAL,
      avg_risk_score REAL,
      small_sample_warning BOOLEAN
    );
    
    CREATE TABLE IF NOT EXISTS mp_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state TEXT,
      mp_name TEXT,
      total_works INTEGER,
      works_with_sanction_data INTEGER,
      total_sanctioned_amount REAL,
      high_critical_count INTEGER,
      avg_risk_score REAL,
      max_risk_score REAL,
      high_critical_rate_pct REAL,
      small_sample_warning BOOLEAN
    );
  `);
  
  return db;
}
