/** @param {NS} ns */
export async function main(ns) {
    const visited = [];

    function dfs(host) {
        if (visited.includes(host)) return;
        visited.push(host);
        const neighbors = ns.scan(host);
        for (const neighbor of neighbors) {
            dfs(neighbor);
        }
    }

    dfs(ns.args[0] || "home");
    ns.tprint(visited);
}