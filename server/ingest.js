import fs from 'node:fs';
import path from 'node:path';
import csv from 'csv-parser';
import { initDb, getDb } from './db.js';

async function ingestCsv(filePath, db, tableName, insertQuery, rowMapper) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(rowMapper(data));
      })
      .on('end', async () => {
        try {
          const stmt = await db.prepare(insertQuery);
          for (const row of results) {
            await stmt.run(row);
          }
          await stmt.finalize();
          console.log(`Ingested ${results.length} rows into ${tableName}`);
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

function parseBool(val) {
  if (!val) return false;
  return val.toLowerCase() === 'true';
}

function parseFloatSafe(val) {
  if (!val) return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
}

function parseIntSafe(val) {
  if (!val) return null;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? null : parsed;
}

async function run() {
  console.log('Initializing database...');
  const db = await initDb();
  
  // Clear existing data
  await db.exec('DELETE FROM projects');
  await db.exec('DELETE FROM state_summaries');
  await db.exec('DELETE FROM mp_summaries');

  console.log('Ingesting projects...');
  await ingestCsv(
    path.resolve(import.meta.dirname, '../data/processed/project_risk_results.csv'),
    db,
    'projects',
    `INSERT INTO projects (
      work_id, state, constituency, mp_name, work_category, sanction_amount,
      work_status, analysis_mode, effectively_completed, risk_score, risk_category,
      n_signals_available, split_payment_flag, is_govt_body, any_is_anomaly_v2,
      any_is_anomaly_lof, cost_deviation_pct, utilization_pct_completed,
      recommendation_to_sanction_days, rule_expenditure_over_sanction,
      rule_extreme_delay, rule_vendor_concentration, known_false_positive
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    (row) => [
      row.work_id, row.state, row.constituency, row.mp_name, row.work_category, parseFloatSafe(row.sanction_amount),
      row.work_status, row.analysis_mode, parseBool(row.effectively_completed), parseFloatSafe(row.risk_score), row.risk_category,
      parseIntSafe(row.n_signals_available), parseBool(row.split_payment_flag), parseBool(row.is_govt_body), row.any_is_anomaly_v2,
      row.any_is_anomaly_lof, parseFloatSafe(row.cost_deviation_pct), parseFloatSafe(row.utilization_pct_completed),
      parseFloatSafe(row.recommendation_to_sanction_days), parseBool(row.rule_expenditure_over_sanction),
      parseBool(row.rule_extreme_delay), parseBool(row.rule_vendor_concentration), parseBool(row.known_false_positive)
    ]
  );

  console.log('Ingesting state summaries...');
  await ingestCsv(
    path.resolve(import.meta.dirname, '../data/processed/state_risk_summary.csv'),
    db,
    'state_summaries',
    `INSERT INTO state_summaries (
      state, total_works, works_with_sanction_data, total_sanctioned_amount,
      high_critical_count, high_critical_rate_pct, avg_risk_score, small_sample_warning
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    (row) => [
      row.state, parseIntSafe(row.total_works), parseIntSafe(row.works_with_sanction_data), parseFloatSafe(row.total_sanctioned_amount),
      parseIntSafe(row.high_critical_count), parseFloatSafe(row.high_critical_rate_pct), parseFloatSafe(row.avg_risk_score), parseBool(row.small_sample_warning)
    ]
  );

  console.log('Ingesting MP summaries...');
  await ingestCsv(
    path.resolve(import.meta.dirname, '../data/processed/mp_risk_summary.csv'),
    db,
    'mp_summaries',
    `INSERT INTO mp_summaries (
      state, mp_name, total_works, works_with_sanction_data, total_sanctioned_amount,
      high_critical_count, avg_risk_score, max_risk_score, high_critical_rate_pct, small_sample_warning
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    (row) => [
      row.state, row.mp_name, parseIntSafe(row.total_works), parseIntSafe(row.works_with_sanction_data), parseFloatSafe(row.total_sanctioned_amount),
      parseIntSafe(row.high_critical_count), parseFloatSafe(row.avg_risk_score), parseFloatSafe(row.max_risk_score), parseFloatSafe(row.high_critical_rate_pct), parseBool(row.small_sample_warning)
    ]
  );

  console.log('Ingestion complete.');
}

run().catch(console.error);
