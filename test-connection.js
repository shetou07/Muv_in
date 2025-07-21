const { HttpAgent } = require('@dfinity/agent');

async function testConnection() {
  console.log('🧪 Testing ICP Service Connection...');
  
  const host = 'http://127.0.0.1:4943';
  const canisterId = 'uxrrr-q7777-77774-qaaaq-cai';
  
  try {
    const agent = new HttpAgent({ host });
    
    // Fetch root key for local development
    await agent.fetchRootKey();
    
    console.log('✅ Successfully connected to DFX network');
    console.log(`📍 Host: ${host}`);
    console.log(`🆔 Canister ID: ${canisterId}`);
    
    // Test a simple call
    const response = await agent.query(canisterId, {
      methodName: 'getPlatformStats',
      arg: new ArrayBuffer(0),
    });
    
    console.log('✅ Successfully called backend method');
    console.log('🎉 Connection test passed!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('💡 Make sure DFX is running with: dfx start --background --host 0.0.0.0:4943');
  }
}

testConnection();
