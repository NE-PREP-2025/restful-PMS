const bcrypt = require('bcrypt');

async function generatePassword() {
  const password = 'adminEllaP123';
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed Password:', hashedPassword);
}

generatePassword();
