const os = require('os');
const { spawn } = require('child_process');

/**
 * Detecta automáticamente la IP de la red Wi-Fi / LAN real,
 * ignorando adaptadores virtuales como Tailscale (100.x) o VirtualBox (192.168.56.1)
 * que hacen que Expo Go se quede cargando infinitamente al escanear el QR.
 */
function detectLanIp() {
  if (process.env.REACT_NATIVE_PACKAGER_HOSTNAME) {
    return process.env.REACT_NATIVE_PACKAGER_HOSTNAME;
  }

  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    const lowerName = name.toLowerCase();
    const isVirtualAdapter =
      lowerName.includes('tailscale') ||
      lowerName.includes('virtualbox') ||
      lowerName.includes('vbox') ||
      lowerName.includes('vethernet') ||
      lowerName.includes('wsl') ||
      lowerName.includes('docker') ||
      lowerName.includes('vmware');

    for (const addr of addrs) {
      if (addr.family !== 'IPv4' || addr.internal) continue;
      // Ignorar rango CGNAT de Tailscale (100.64.0.0/10) y Host-Only de VirtualBox (192.168.56.x)
      if (
        addr.address.startsWith('100.') ||
        addr.address.startsWith('192.168.56.') ||
        addr.address.startsWith('169.254.')
      ) {
        continue;
      }

      candidates.push({
        name,
        address: addr.address,
        isWifi: lowerName.includes('wi-fi') || lowerName.includes('wlan'),
        isVirtualAdapter,
      });
    }
  }

  // Priorizar adaptador Wi-Fi no virtual
  candidates.sort((a, b) => {
    if (a.isVirtualAdapter !== b.isVirtualAdapter) {
      return a.isVirtualAdapter ? 1 : -1;
    }
    if (a.isWifi !== b.isWifi) {
      return a.isWifi ? -1 : 1;
    }
    return 0;
  });

  return candidates.length > 0 ? candidates[0].address : undefined;
}

const detectedIp = detectLanIp();
const env = { ...process.env };

if (detectedIp) {
  env.REACT_NATIVE_PACKAGER_HOSTNAME = detectedIp;
  console.log(
    `\n🌐 [HeroForge RPG] IP Wi-Fi/LAN detectada automáticamente para Expo Go: ${detectedIp} (ignorando Tailscale/VirtualBox)\n`
  );
}

const extraArgs = process.argv.slice(2);
const expoBin = require.resolve('expo/bin/cli');

const child = spawn(process.execPath, [expoBin, 'start', ...extraArgs], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

