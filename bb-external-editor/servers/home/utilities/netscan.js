/** @param {NS} ns */
export async function main(ns) {
    const dfs = (startHost) => {
        const hosts = new Set([startHost]);
        for (const host of hosts) {ns.scan(host).forEach(n => hosts.add(n));}
        return [...hosts];
    };

    const dfshost = ns.args[0] || "home";
    const servers = dfs(dfshost);
    ns.tprint("✅ Network Scan Complete");
    ns.tprint("Network Length: " + servers.length);
    ns.tprint("Hosts Discovered: " + servers.join(", "));

}