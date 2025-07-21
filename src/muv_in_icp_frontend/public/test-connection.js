// Quick test to check canister connection
console.log('Testing canister connection...');
console.log('HOST:', window.location.protocol + '//' + window.location.hostname.replace('-3000.', '-4943.'));
console.log('CANISTER_ID:', 'uxrrr-q7777-77774-qaaaq-cai');

// Test the connection
fetch(window.location.protocol + '//' + window.location.hostname.replace('-3000.', '-4943.') + '/api/v2/status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/cbor',
  }
})
.then(response => {
  console.log('DFX Status Response:', response.status);
  return response.text();
})
.then(data => {
  console.log('DFX Response Data:', data);
})
.catch(error => {
  console.error('DFX Connection Error:', error);
});
