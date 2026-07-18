import { execSync } from 'child_process';
import fs from 'fs';
import { join } from 'path';

const projectDir = process.cwd();
const localDistInstaller = join(projectDir, 'dist-installer');
const buildDistInstaller = "C:/Users/carbon.DESKTOP-AR2NFC4/AppData/Local/Temp/dist-installer";
const tmpDir = join(buildDistInstaller, 'win-unpacked.tmp');
const destDir = join(buildDistInstaller, 'win-unpacked');

function clean() {
  console.log('Cleaning build directory in AppData Temp...');
  if (fs.existsSync(buildDistInstaller)) {
    try {
      fs.rmSync(buildDistInstaller, { recursive: true, force: true });
    } catch (err) {
      console.warn('Warning: Could not fully clean build directory:', err.message);
    }
  }
  console.log('Cleaning local dist-installer directory...');
  if (fs.existsSync(localDistInstaller)) {
    try {
      fs.rmSync(localDistInstaller, { recursive: true, force: true });
    } catch (err) {
      console.warn('Warning: Could not fully clean local directory:', err.message);
    }
  }
}

function runCommand(cmd) {
  console.log(`Running: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  clean();
  
  console.log('Step 1: Building unpacked directory...');
  try {
    runCommand('npx electron-builder --win --dir');
  } catch (error) {
    console.log('Packager command failed. Checking if tmp directory is renameable...');
    await delay(3000); // Wait a bit before checking
    if (fs.existsSync(tmpDir) && !fs.existsSync(destDir)) {
      console.log('Found win-unpacked.tmp. Attempting manual rename with retries...');
      let renamed = false;
      for (let i = 0; i < 15; i++) {
        try {
          fs.renameSync(tmpDir, destDir);
          console.log('Successfully renamed win-unpacked.tmp to win-unpacked!');
          renamed = true;
          break;
        } catch (renameErr) {
          console.log(`Rename attempt ${i + 1} failed: ${renameErr.message}. Retrying in 2 seconds...`);
          await delay(2000);
        }
      }
      if (!renamed) {
        throw new Error('Failed to rename win-unpacked.tmp after multiple attempts.');
      }
    } else {
      throw error;
    }
  }

  console.log('Step 2: Creating NSIS Installer from prepackaged directory...');
  runCommand(`npx electron-builder --win --prepackaged "${destDir}"`);
  
  console.log('Step 3: Copying output installer back to local workspace...');
  if (!fs.existsSync(localDistInstaller)) {
    fs.mkdirSync(localDistInstaller, { recursive: true });
  }

  const files = fs.readdirSync(buildDistInstaller);
  let installerCopied = false;
  for (const file of files) {
    if (file.endsWith('.exe')) {
      const srcFile = join(buildDistInstaller, file);
      const destFile = join(localDistInstaller, file);
      console.log(`Copying installer from ${srcFile} to ${destFile}...`);
      fs.copyFileSync(srcFile, destFile);
      installerCopied = true;
    }
  }

  if (installerCopied) {
    console.log('Build and packaging completed successfully!');
  } else {
    throw new Error('No installer .exe file found in build directory after package command.');
  }
}

main().catch(err => {
  console.error('Build script failed:', err);
  process.exit(1);
});
