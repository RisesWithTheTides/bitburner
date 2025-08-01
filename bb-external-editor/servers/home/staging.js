/** @param {NS} ns */
export async function main(ns) {
    while (true) {
        // DFS scan
        const dfs = (startHost) => {
            const hosts = new Set([startHost]);
            for (const host of hosts) { ns.scan(host).forEach(n => hosts.add(n)); }
            return [...hosts];
        };

        // Breach function
        function breach(ns, server) {
            try { ns.brutessh(server); } catch { }
            try { ns.ftpcrack(server); } catch { }
            try { ns.relaysmtp(server); } catch { }
            try { ns.httpworm(server); } catch { }
            try { ns.sqlinject(server); } catch { }
            try { ns.nuke(server); } catch { }
            return ns.hasRootAccess(server);
        }

        const dfshost = ns.args[0] || "home";
        const servers = dfs(dfshost);
        const rootedServers = [];

        for (const server of servers) {
            if (ns.hasRootAccess(server)) {
                rootedServers.push(server);
            } else if (breach(ns, server)) {
                rootedServers.push(server);
            }
        }

        ns.tprint("📁 Rooted Servers: " + rootedServers.sort().join(", "));
        const filesToDeploy = ["hack.js", "weaken.js", "grow.js"];

        // Deploy files to rooted servers
        for (const server of rootedServers) {
            for (const file of filesToDeploy) {
                if (!ns.fileExists(file, server)) {
                    await ns.scp(file, server, "home");
                }
            }
        }
        await ns.sleep(60000); // Wait 1 minute before repeating
    }
}