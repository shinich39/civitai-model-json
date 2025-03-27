import { execSync } from "node:child_process";

const commands = [
  "git add .", 
  `git commit -m "Updated using automation script"`, 
  "git push origin main",
];

try {
  execSync(commands.join(" && "));
} catch(err) {
  console.error(err);
  process.exit(1);
}