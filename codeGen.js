// utils/codeGen.js
function generateSubscriptionCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  let sum = [...code].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  code += "-" + (sum % 36).toString(36).toUpperCase().padStart(2, "0");
  return code;
}

module.exports = { generateSubscriptionCode };
