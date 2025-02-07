import { initDatabase } from './supabase';

async function runTests() {
  try {
    console.log('🔍 Початок тестування...');
    
    // Ініціалізація бази даних
    await initDatabase();
    
    console.log('✅ Тестування завершено успішно!');
  } catch (error) {
    console.error('❌ Помилка під час тестування:', error);
  }
}

runTests();