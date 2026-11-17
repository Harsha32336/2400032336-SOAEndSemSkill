const tokenField = document.querySelector('#token');
const result = document.querySelector('#result');

async function loadDemo(state) {
  const response = await fetch(`/api/jwt/demo-token/${state}`);
  const data = await response.json();
  tokenField.value = data.token;
  result.textContent = `${state} token loaded. Click Validate token.`;
}

async function validate() {
  result.textContent = 'Validating...';
  const response = await fetch('/api/jwt/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: tokenField.value })
  });
  result.textContent = JSON.stringify(await response.json(), null, 2);
}

document.querySelectorAll('[data-state]').forEach((button) => {
  button.addEventListener('click', () => loadDemo(button.dataset.state));
});
document.querySelector('#validate').addEventListener('click', validate);