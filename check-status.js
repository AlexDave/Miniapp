const axios = require('axios');

async function checkBackend() {
  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend работает:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Backend не отвечает:', error.message);
    return false;
  }
}

async function checkFrontend() {
  try {
    const response = await axios.get('http://localhost:5173');
    console.log('✅ Frontend работает (статус:', response.status + ')');
    return true;
  } catch (error) {
    console.log('❌ Frontend не отвечает:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Проверка статуса приложения...\n');
  
  const backendOk = await checkBackend();
  const frontendOk = await checkFrontend();
  
  console.log('\n📊 Результат:');
  if (backendOk && frontendOk) {
    console.log('🎉 Все сервисы работают!');
    console.log('🌐 Frontend: http://localhost:5173');
    console.log('🔧 Backend: http://localhost:5000');
  } else {
    console.log('⚠️ Некоторые сервисы не работают');
  }
}

main();
