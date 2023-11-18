import os from "os";

// Convertir la taille de la mémoire en gigaoctets
const convertToGB = (bytes) => {
  return (bytes / 1024 ** 3).toFixed(2);
};

// Obtenir des informations sur le système
const getSystemInfo = () => {
  const platform = os.platform();
  const arch = os.arch();
  const cpus = os.cpus();
  const totalMemory = convertToGB(os.totalmem());
  const freeMemory = convertToGB(os.freemem());

  // Formater les informations
  const formattedInfo = `
  Operating System: ${platform} ${arch}
  RAM: ${totalMemory} GB
  Processor: ${cpus[0].model}\n  Cores: ${cpus.length} 
  FreeMemory: ${freeMemory} GB
  `;
  
  return formattedInfo;
};

// Exemple d'utilisation
export default getSystemInfo();
