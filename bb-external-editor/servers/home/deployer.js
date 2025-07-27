/** @param {NS} ns */
export async function main(ns) {
    const args = ns.args;

    if (args.length < 2) {
        ns.tprint("❌ Usage: run deployer.js '[\"server1\",\"server2\"]' script1.js script2.js ...");
        return;
    }

    const servers = JSON.parse(args[0]);
    const files = args.slice(1);
    const controllerFile = "controller.js";

    for (const server of servers) {
        let allCopied = true;

        for (const file of files) {
            const copied = await ns.scp(file, server);
            if (copied) {
                ns.tprint(`✅ Copied ${file} → ${server}`);
            } else {
                ns.tprint(`❌ Failed to copy ${file} → ${server}`);
                allCopied = false;
            }
        }

        // Only exec controller if all files were copied
        if (allCopied && files.includes(controllerFile)) {
            const threads = 1; // adjust as needed
            const pid = ns.exec(controllerFile, server, threads);

            if (pid !== 0) {
                ns.tprint(`🚀 Launched ${controllerFile} on ${server}`);
            } else {
                ns.tprint(`⚠️ Failed to launch ${controllerFile} on ${server}`);
            }
        }
    }
}