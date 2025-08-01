/** @param {NS} ns */
export async function main(ns) {
    const target = "joesguns";
    const files = ["hack.js", "weaken.js", "grow.js"];
    const checkInterval = 5000; // 5s controller loop

    while (true) {
        const rooted = getRootedServers(ns);

        // Analyze joesguns
        const maxMoney = ns.getServerMaxMoney(target);
        const minSec = ns.getServerMinSecurityLevel(target);
        const money = ns.getServerMoneyAvailable(target);
        const security = ns.getServerSecurityLevel(target);

        // Calculate available RAM across all rooted servers (excluding home)
        const ramServers = rooted.filter(s => s !== "home");
        const totalFreeRam = ramServers
            .map(s => ns.getServerMaxRam(s) - ns.getServerUsedRam(s))
            .reduce((a, b) => a + b, 0);

        const weakenRam = ns.getScriptRam("weaken.js");
        const growRam = ns.getScriptRam("grow.js");
        const hackRam = ns.getScriptRam("hack.js");
        let weakenThreads = 0, growThreads = 0, hackThreads = 0;

        // Dynamic thread calculation
        if (security > minSec + 5) {
            // Weaken until security is at minimum
            weakenThreads = Math.floor(totalFreeRam / weakenRam);
        } else if (money < maxMoney * 0.9) {
            // Grow until money is near max
            growThreads = Math.floor(totalFreeRam / growRam);
        } else {
            // Hack only up to 50% of available money
            const maxHackThreads = Math.floor(ns.hackAnalyzeThreads(target, money * 0.5));
            hackThreads = Math.min(Math.floor(totalFreeRam / hackRam), maxHackThreads);

            // Use leftover RAM for weaken/grow
            let ramLeft = totalFreeRam - hackThreads * hackRam;
            weakenThreads = Math.floor(ramLeft / weakenRam);
            ramLeft -= weakenThreads * weakenRam;
            growThreads = Math.floor(ramLeft / growRam);
        }

        // Create job queue
        const jobQueue = [];
        if (weakenThreads > 0) jobQueue.push({ script: "weaken.js", target, threads: weakenThreads });
        if (growThreads > 0) jobQueue.push({ script: "grow.js", target, threads: growThreads });
        if (hackThreads > 0) jobQueue.push({ script: "hack.js", target, threads: hackThreads });

        // Dispatch jobs to all rooted servers
        for (const server of ramServers) {
            let freeRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);

            for (const job of jobQueue) {
                if (job.threads <= 0) continue;
                const scriptRam = ns.getScriptRam(job.script);
                const threads = Math.min(job.threads, Math.floor(freeRam / scriptRam));
                if (threads > 0) {
                    ns.exec(job.script, server, threads, job.target);
                    job.threads -= threads;
                    freeRam -= threads * scriptRam;
                }
            }
        }

        await ns.sleep(checkInterval);
    }

    function getRootedServers(ns) {
        const scanned = scanAll(ns);
        return scanned.filter(s => ns.hasRootAccess(s));
    }

    function scanAll(ns, start = "home", visited = new Set()) {
        visited.add(start);
        for (const host of ns.scan(start)) {
            if (!visited.has(host)) scanAll(ns, host, visited);
        }
        return [...visited];
    }
}