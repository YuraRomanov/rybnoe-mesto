import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function patchAndroidManifest() {
  const manifestPath = join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  if (!existsSync(manifestPath)) return false;

  let xml = readFileSync(manifestPath, 'utf8');
  if (xml.includes('android:screenOrientation=')) {
    xml = xml.replace(/android:screenOrientation="[^"]*"/g, 'android:screenOrientation="sensorLandscape"');
  } else {
    xml = xml.replace(
      /<activity\b/,
      '<activity\n            android:screenOrientation="sensorLandscape"',
    );
  }
  writeFileSync(manifestPath, xml);
  console.log('Android: landscape lock applied');
  return true;
}

function patchIosInfoPlist() {
  const plistPath = join(root, 'ios', 'App', 'App', 'Info.plist');
  if (!existsSync(plistPath)) return false;

  let xml = readFileSync(plistPath, 'utf8');
  const landscapeOnly = `	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UISupportedInterfaceOrientations~ipad</key>
	<array>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>`;

  xml = xml.replace(
    /<key>UISupportedInterfaceOrientations<\/key>[\s\S]*?<\/array>\s*<key>UISupportedInterfaceOrientations~ipad<\/key>[\s\S]*?<\/array>/,
    landscapeOnly,
  );
  writeFileSync(plistPath, xml);
  console.log('iOS: landscape-only orientations applied');
  return true;
}

const android = patchAndroidManifest();
const ios = patchIosInfoPlist();

if (!android && !ios) {
  console.log('Нет нативных проектов для патча (android/ios)');
}
